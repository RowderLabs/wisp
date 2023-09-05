use itertools::Itertools;

use crate::prisma::{self, person, relationship};
use nanoid::nanoid;
use std::collections::{BTreeMap, HashSet};

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

#[derive(Debug, Clone)]
pub struct TreeLinkData(i32);

#[derive(Debug, Clone)]
pub struct TreeLink {
    source: TreeLinkData,
    target: TreeLinkData,
    link: TreeLinkData,
}

#[derive(Debug, Clone)]
pub struct TreeNode {
    id: String,
    parent_id: Option<String>,
    hidden: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
enum NodeType {
    Relation,
    Person,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
struct TreeKey(i32, NodeType);

#[derive(Debug)]
pub struct TreeData {
    nodes: Vec<TreeNode>,
    links: Vec<TreeLink>,
}

pub struct FamilyTreeBuilder {
    family_id: Option<i32>,
    parent_relation_id: Option<i32>,
    nodes: BTreeMap<TreeKey, TreeNode>,
    links: Vec<TreeLink>,
}

impl FamilyTreeBuilder {
    pub fn init() -> FamilyTreeBuilder {
        FamilyTreeBuilder {
            family_id: None,
            parent_relation_id: None,
            nodes: BTreeMap::new(),
            links: Vec::new(),
        }
    }

    pub fn family(self, family_id: i32) -> Self {
        FamilyTreeBuilder {
            family_id: Some(family_id),
            ..self
        }
    }

    pub fn starting_generation(self, parent_relation_id: i32) -> Self {
        FamilyTreeBuilder {
            parent_relation_id: Some(parent_relation_id),
            ..self
        }
    }

    pub async fn build(mut self, prisma: &prisma::PrismaClient) -> TreeData {
        self._build_root(prisma).await;

        let mut current = prisma
            .person()
            .find_many(vec![person::parent_relation_id::equals(
                self.parent_relation_id,
            )])
            .select(tree_person::select())
            .exec()
            .await
            .unwrap();

        loop {
            self._build_generation(&current);

            let children_ids = current
                .iter()
                .flat_map(|p| p.relationships.iter().filter(|r| r.children.len() > 0))
                .map(|r| r.id)
                .collect_vec();

            if children_ids.len() == 0 {
                break;
            }

            let next_gen_queries = children_ids.iter().map(|id| {
                prisma
                    .person()
                    .find_many(vec![person::parent_relation_id::equals(Some(*id))])
                    .select(tree_person::select())
            });

            current = prisma
                ._batch(next_gen_queries)
                .await
                .unwrap()
                .into_iter()
                .flatten()
                .collect_vec();
        }

        println!("{:#?}", self.nodes.len());

        TreeData {
            nodes: self.nodes.values().into_iter().cloned().collect_vec(),
            links: self.links,
        }
    }

    async fn _build_root(&mut self, prisma: &prisma::PrismaClient) {
        self.nodes.insert(
            TreeKey(0, NodeType::Relation),
            TreeNode {
                id: nanoid!(5),
                parent_id: None,
                hidden: true,
            },
        );
    }

    fn get_parent_id(&self, key: &TreeKey) -> Option<String> {
        Some(self.nodes.get(key).unwrap().id.clone())
    }

    pub fn _build_generation(&mut self, data: &Vec<tree_person::Data>) {
        data.iter().for_each(|p| {
            //push person
            self.nodes.insert(
                TreeKey(p.id, NodeType::Person),
                TreeNode {
                    id: nanoid!(5),
                    parent_id: self.get_parent_id(&TreeKey(
                        p.parent_relation_id.unwrap_or(0),
                        NodeType::Relation,
                    )),
                    hidden: false,
                },
            );

            //if relationships push members
            p.relationships.iter().for_each(|r| {
                if r.members.len() > 0 {
                    //hidden relationship node
                    self.nodes.insert(
                        TreeKey(r.id, NodeType::Relation),
                        TreeNode {
                            id: nanoid!(5),
                            parent_id: self.get_parent_id(&TreeKey(
                                p.parent_relation_id.unwrap_or(0),
                                NodeType::Relation,
                            )),
                            hidden: true,
                        },
                    );
                }

                //members of relationship that are not current person
                r.members.iter().for_each(|m| {
                    self.nodes.insert(
                        TreeKey(m.id, NodeType::Person),
                        TreeNode {
                            id: nanoid!(5),
                            parent_id: self.get_parent_id(&TreeKey(
                                p.parent_relation_id.unwrap_or(0),
                                NodeType::Relation,
                            )),
                            hidden: false,
                        },
                    );
                })
            })
        });
    }
}
