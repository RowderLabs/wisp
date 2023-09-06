use super::error::{TreeError, NodeNotFoundSnafu};
use super::{
    Tree, TreeData, TreeEntity, TreeKey, TreeLink, TreeLinkData, TreeNode, TreeNodeType,
    TreeNodeWithData,
};
use crate::prisma::person;
use indexmap::{map::Entry, IndexMap};
use itertools::Itertools;
use nanoid::nanoid;
use prisma_client_rust::prisma_models::Index;
use snafu::OptionExt;
pub mod builder;

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

#[derive(Clone, Debug)]
pub struct FamilyTreeNodeData {
    name: String,
}

pub struct FamilyTree {
    nodes: IndexMap<TreeKey, TreeNodeType<FamilyTreeNodeData>>,
    links: IndexMap<TreeKey, TreeLink>,
}

impl Tree<tree_person::Data, FamilyTreeNodeData> for FamilyTree {
    fn into_tree_data(self) -> TreeData<FamilyTreeNodeData> {
        TreeData {
            nodes: self.nodes.values().into_iter().cloned().collect_vec(),
            links: self.links.values().into_iter().cloned().collect_vec(),
        }
    }

    fn create_level(&mut self, data: &Vec<tree_person::Data>) -> Result<(), TreeError> {
        for p in data.iter() {
            //push person
            let relation_id = self
                .get_node_id(&TreeKey(
                    p.parent_relation_id.unwrap_or(0),
                    TreeEntity::Relation,
                ))
                .context(NodeNotFoundSnafu)?;

            self.insert_node_once(
                TreeKey(p.id, TreeEntity::Person),
                Some(FamilyTreeNodeData {
                    name: p.name.clone(),
                }),
                Some(relation_id),
                false,
            );

            //if relationships push members
            p.relationships.iter().for_each(|r| {
                if r.members.len() > 0 {
                    //hidden relationship node
                    self.insert_node_once(
                        TreeKey(r.id, TreeEntity::Relation),
                        None,
                        self.get_node_id(&TreeKey(
                            p.parent_relation_id.unwrap_or(0),
                            TreeEntity::Relation,
                        )),
                        true,
                    );
                }

                //members of relationship that are not current person
                r.members.iter().for_each(|m| {
                    let parent_id = self.get_node_id(&TreeKey(
                        p.parent_relation_id.unwrap_or(0),
                        TreeEntity::Relation,
                    ));

                    self.insert_node_once(
                        TreeKey(m.id, TreeEntity::Person),
                        Some(FamilyTreeNodeData {
                            name: m.name.clone(),
                        }),
                        parent_id.clone(),
                        false,
                    );

                    if m.id != p.id {
                        self.insert_link_once(
                            TreeKey(r.id, TreeEntity::Relation),
                            self.get_node_id(&TreeKey(p.id, TreeEntity::Person)),
                            self.get_node_id(&TreeKey(m.id, TreeEntity::Person)),
                            self.get_node_id(&TreeKey(r.id, TreeEntity::Relation)),
                        );
                    }
                });
            })
        }

        Ok(())
    }

    fn new() -> FamilyTree {
        let mut tree = FamilyTree {
            nodes: IndexMap::new(),
            links: IndexMap::new(),
        };

        tree.create_root();
        tree
    }
}

impl FamilyTree {
    fn get_node_id(&self, key: &TreeKey) -> Option<String> {
        self.nodes.get(key).map(|n| n.get_id())
    }

    pub fn insert_node_once(
        &mut self,
        key: TreeKey,
        data: Option<FamilyTreeNodeData>,
        parent_id: Option<String>,
        hidden: bool,
    ) {
        match self.nodes.entry(key) {
            Entry::Vacant(entry) => {
                let node = match data {
                    Some(data) => TreeNodeType::WithData(TreeNodeWithData {
                        id: nanoid!(8),
                        parent_id,
                        data,
                        hidden,
                    }),
                    None => TreeNodeType::Node(TreeNode {
                        id: nanoid!(8),
                        parent_id,
                        hidden,
                    }),
                };

                entry.insert(node);
            }
            _ => (),
        };
    }

    pub fn insert_link_once(
        &mut self,
        key: TreeKey,
        source_id: Option<String>,
        target_id: Option<String>,
        link_id: Option<String>,
    ) {
        match self.links.entry(key) {
            Entry::Vacant(entry) => {
                let result = TreeLink {
                    source: TreeLinkData(source_id.unwrap()),
                    target: TreeLinkData(target_id.unwrap()),
                    link: TreeLinkData(link_id.unwrap()),
                };
                entry.insert(result);
            }
            Entry::Occupied(_) => {}
        }
    }

    fn create_root(&mut self) {
        self.insert_node_once(
            TreeKey(0, TreeEntity::Relation),
            Some(FamilyTreeNodeData {
                name: "ROOT".into(),
            }),
            None,
            true,
        );
    }
}
