use itertools::Itertools;

use crate::{
    prisma::{self, person, relationship},
    TreeData, TreeLink, TreeLinkData, TreeNode,
};
use std::collections::HashSet;

pub struct TreeBuilder {
    seen: HashSet<i32>,
    nodes: Vec<TreeNode>,
    links: Vec<TreeLink>,
}

person::select!(tree_person {
    id
    name
    parent_relation_id
    relationships: select {
        id
        members: select {
            id
            name
        }
        children: select {
            id
        }
    }
});

impl TreeBuilder {
    pub fn init() -> TreeBuilder {
        TreeBuilder {
            seen: HashSet::new(),
            nodes: Vec::new(),
            links: Vec::new(),
        }
    }

    pub async fn build(mut self, prisma: &prisma::PrismaClient) -> TreeData {
        let mut current = self._build_root(prisma).await;

        loop {
            let next = self._build_generation(&mut current);

            let next_generation = next.iter().map(|id| {
                prisma
                    .person()
                    .find_many(vec![person::parent_relation_id::equals(Some(*id))])
                    .select(tree_person::select())
            });

            if next_generation.len() == 0 {
                break;
            }

            current = prisma
                ._batch(next_generation)
                .await
                .unwrap()
                .into_iter()
                .flatten()
                .collect_vec();
        }

        TreeData {
            nodes: self.nodes,
            links: self.links,
        }
    }

    async fn _build_root(&mut self, prisma: &prisma::PrismaClient) -> Vec<tree_person::Data> {
        self.nodes.push(TreeNode {
            id: 0,
            parent_id: None,
            hidden: true,
        });
        let first_gen = prisma
            .person()
            .find_many(vec![person::family_id::equals(Some(1))])
            .select(tree_person::select())
            .exec()
            .await
            .unwrap();
        first_gen
    }

    pub fn _build_generation(&mut self, data: &mut Vec<tree_person::Data>) -> Vec<i32> {
        let mut relations_with_children = vec![];
        data.into_iter().for_each(|p| {
            //push person
            self.nodes.push(TreeNode {
                id: p.id,
                parent_id: Some(0),
                hidden: false,
            });
            let relations = p.relationships.clone();
            //if relationships push members

            relations.into_iter().for_each(|r| {
                let members = r.members;
                let shared_children = r.children;

                if members.len() > 0 {
                    //hidden relationship node
                    self.nodes.push(TreeNode {
                        id: r.id,
                        parent_id: p.parent_relation_id,
                        hidden: true,
                    });

                    //members of relationship that are not current person
                    members.into_iter().for_each(|m| {
                        if m.id != p.id {
                            self.nodes.push(TreeNode {
                                id: m.id,
                                parent_id: Some(0),
                                hidden: false,
                            });

                            //link relations
                            self.links.push(TreeLink {
                                source: TreeLinkData { id: p.id },
                                target: TreeLinkData { id: m.id },
                            })
                        }
                    })
                }

                if shared_children.len() > 0 {
                    relations_with_children.push(r.id)
                }
            })
        });
        relations_with_children
    }
}
