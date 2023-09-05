use itertools::Itertools;

use crate::prisma::{self, person, relationship};
use nanoid::nanoid;
use std::collections::btree_map::Entry;
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
pub struct TreeLinkData(String);

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
enum TreeEntity {
    Relation,
    Person,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
struct TreeKey(i32, TreeEntity);

#[derive(Debug)]
pub struct TreeData {
    nodes: Vec<TreeNode>,
    links: Vec<TreeLink>,
}

pub struct FamilyTreeBuilder {
    family_id: Option<i32>,
    parent_relation_id: Option<i32>,
    nodes: BTreeMap<TreeKey, TreeNode>,
    links: BTreeMap<TreeKey, TreeLink>,
}

impl FamilyTreeBuilder {
    pub fn init() -> FamilyTreeBuilder {
        FamilyTreeBuilder {
            family_id: None,
            parent_relation_id: None,
            nodes: BTreeMap::new(),
            links: BTreeMap::new(),
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

    async fn _batch_fetch_descendants(
        &self,
        prisma: &prisma::PrismaClient,
        relation_ids: Vec<i32>,
    ) -> Vec<tree_person::Data> {
        let queries = relation_ids.iter().map(|id| {
            prisma
                .person()
                .find_many(vec![person::parent_relation_id::equals(Some(*id))])
                .select(tree_person::select())
        });
        prisma
            ._batch(queries)
            .await
            .unwrap()
            .into_iter()
            .flatten()
            .collect_vec()
    }

    async fn _fetch_descendants(
        &self,
        prisma: &prisma::PrismaClient,
        relation_id: Option<i32>,
    ) -> Vec<tree_person::Data> {
        prisma
            .person()
            .find_many(vec![person::parent_relation_id::equals(relation_id)])
            .select(tree_person::select())
            .exec()
            .await
            .unwrap()
    }

    pub async fn build(mut self, prisma: &prisma::PrismaClient) -> TreeData {
        self._build_root(prisma).await;
        let mut current = self
            ._fetch_descendants(prisma, self.parent_relation_id)
            .await;

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

            current = self._batch_fetch_descendants(prisma, children_ids).await;
        }

        TreeData {
            nodes: self.nodes.values().into_iter().cloned().collect_vec(),
            links: self.links.values().into_iter().cloned().collect_vec(),
        }
    }

    async fn _build_root(&mut self, prisma: &prisma::PrismaClient) {
        self.nodes.insert(
            TreeKey(0, TreeEntity::Relation),
            TreeNode {
                id: nanoid!(5),
                parent_id: None,
                hidden: true,
            },
        );
    }

    fn get_node_id(&self, key: &TreeKey) -> Option<String> {
        Some(self.nodes.get(key).unwrap().id.clone())
    }

    fn _insert_node(&mut self, key: TreeKey, value: TreeNode) {
        match self.nodes.entry(key) {
            Entry::Vacant(entry) => {
                println!("inserting node with id {}", value.id.clone());
                entry.insert(value);
            }
            _ => (),
        };
    }

    pub fn _build_generation(&mut self, data: &Vec<tree_person::Data>) {
        data.iter().for_each(|p| {
            //push person
            let relation_id = self.get_node_id(&TreeKey(
                p.parent_relation_id.unwrap_or(0),
                TreeEntity::Relation,
            ));

            self._insert_node(
                TreeKey(p.id, TreeEntity::Person),
                TreeNode {
                    id: nanoid!(),
                    parent_id: relation_id,
                    hidden: false,
                },
            );

            //if relationships push members
            p.relationships.iter().for_each(|r| {
                if r.members.len() > 0 {
                    //hidden relationship node
                    self._insert_node(
                        TreeKey(r.id, TreeEntity::Relation),
                        TreeNode {
                            id: nanoid!(5),
                            parent_id: self.get_node_id(&TreeKey(
                                p.parent_relation_id.unwrap_or(0),
                                TreeEntity::Relation,
                            )),
                            hidden: true,
                        },
                    );
                }

                //members of relationship that are not current person
                r.members.iter().for_each(|m| {
                    let parent_id = self.get_node_id(&TreeKey(
                        p.parent_relation_id.unwrap_or(0),
                        TreeEntity::Relation,
                    ));
                    self._insert_node(
                        TreeKey(m.id, TreeEntity::Person),
                        TreeNode {
                            id: nanoid!(),
                            parent_id,
                            hidden: false,
                        },
                    );

                    if m.id != p.id {
                        self.links.insert(
                            TreeKey(r.id, TreeEntity::Relation),
                            TreeLink {
                                source: TreeLinkData(
                                    self.get_node_id(&TreeKey(p.id, TreeEntity::Person))
                                        .unwrap(),
                                ),
                                target: TreeLinkData(
                                    self.get_node_id(&TreeKey(m.id, TreeEntity::Person))
                                        .unwrap(),
                                ),
                                link: TreeLinkData(
                                    self.get_node_id(&TreeKey(r.id, TreeEntity::Relation))
                                        .unwrap(),
                                ),
                            },
                        );
                    }
                });
            })
        });
    }
}
