use itertools::Itertools;

use crate::prisma::{self, person, relationship};
use std::collections::HashSet;

#[derive(Debug, Clone)]
pub struct TreeLinkData(i32);

#[derive(Debug, Clone)]
pub struct TreeLink {
    source: TreeLinkData,
    target: TreeLinkData,
}

impl TreeLink {
    pub fn new(source: TreeLinkData, target: TreeLinkData) -> TreeLink {
        TreeLink { source, target }
    }
}

#[derive(Debug, Clone)]
pub struct TreeNode {
    id: i32,
    parent_id: Option<i32>,
    hidden: bool,
}

#[derive(Debug)]
pub struct TreeData {
    nodes: Vec<TreeNode>,
    links: Vec<TreeLink>,
}

pub struct FamilyTreeBuilder {
    seen: HashSet<i32>,
    family_id: Option<i32>,
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

impl FamilyTreeBuilder {
    pub fn init() -> FamilyTreeBuilder {
        FamilyTreeBuilder {
            family_id: None,
            seen: HashSet::new(),
            nodes: Vec::new(),
            links: Vec::new(),
        }
    }

    pub fn family(self, family_id: i32) -> Self {
        FamilyTreeBuilder {
            family_id: Some(family_id),
            ..self
        }
    }

    pub async fn build(mut self, prisma: &prisma::PrismaClient) -> TreeData {
        self._build_root(prisma).await;

        let mut current = prisma
            .person()
            .find_many(vec![person::family_id::equals(self.family_id)])
            .select(tree_person::select())
            .exec()
            .await
            .unwrap();

        loop {
            self._build_generation(&current);
            let next_generation: Vec<i32> = current
                .iter()
                .flat_map(|p| {
                    p.relationships
                        .iter()
                        .flat_map(|r| r.children.iter().map(|c| c.id))
                        .collect_vec()
                })
                .collect_vec();

            let next_gen_queries = next_generation.iter().map(|id| {
                prisma
                    .person()
                    .find_many(vec![person::parent_relation_id::equals(Some(*id))])
                    .select(tree_person::select())
            });

            if next_generation.len() == 0 {
                break;
            }

            current = prisma
                ._batch(next_gen_queries)
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

    async fn _build_root(&mut self, prisma: &prisma::PrismaClient) {
        self.nodes.push(TreeNode {
            id: 0,
            parent_id: None,
            hidden: true,
        });
    }

    pub fn _build_generation(&mut self, data: &Vec<tree_person::Data>) {
        data.iter().for_each(|p| {
            //push person
            self.nodes.push(TreeNode {
                id: p.id,
                parent_id: Some(0),
                hidden: false,
            });

            //if relationships push members
            p.relationships.iter().for_each(|r| {
                if r.members.len() > 0 {
                    //hidden relationship node
                    self.nodes.push(TreeNode {
                        id: r.id,
                        parent_id: p.parent_relation_id,
                        hidden: true,
                    });
                }

                //members of relationship that are not current person
                r.members.iter().for_each(|m| {
                    if m.id != p.id {
                        self.nodes.push(TreeNode {
                            id: m.id,
                            parent_id: Some(0),
                            hidden: false,
                        });

                        //link relations
                        self.links
                            .push(TreeLink::new(TreeLinkData(p.id), TreeLinkData(m.id)))
                    }
                })
            })
        });
    }
}
