use super::error::{NodeNotFoundSnafu, TreeError};
use super::{
    BuildableTree, Tree, TreeData, TreeEntity, TreeKey, TreeLink, TreeLinkData, TreeNode,
    TreeNodeType, TreeNodeWithData,
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

impl BuildableTree<tree_person::Data, FamilyTreeNodeData> for Tree<FamilyTreeNodeData> {
    fn new() -> Tree<FamilyTreeNodeData> {
        let mut tree: Tree<FamilyTreeNodeData> = Tree {
            nodes: IndexMap::new(),
            links: IndexMap::new(),
        };
        tree.insert_node_once(TreeKey(0, TreeEntity::RelationNode), None, None, true);
        tree
    }
    fn create_level(&mut self, data: &Vec<tree_person::Data>) -> Result<(), TreeError> {
        for p in data.iter() {
            //push person
            let relation_id = self
                .get_node_id(p.parent_relation_id.unwrap_or(0), TreeEntity::RelationNode)
                .context(NodeNotFoundSnafu)?;

            self.insert_node_once(
                TreeKey(p.id, TreeEntity::Node),
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
                        TreeKey(r.id, TreeEntity::RelationNode),
                        None,
                        self.get_node_id(
                            p.parent_relation_id.unwrap_or(0),
                            TreeEntity::RelationNode,
                        ),
                        true,
                    );
                }

                //members of relationship that are not current person
                r.members.iter().for_each(|m| {
                    let parent_id = self
                        .get_node_id(p.parent_relation_id.unwrap_or(0), TreeEntity::RelationNode);

                    self.insert_node_once(
                        TreeKey(m.id, TreeEntity::Node),
                        Some(FamilyTreeNodeData {
                            name: m.name.clone(),
                        }),
                        parent_id.clone(),
                        false,
                    );

                    if m.id != p.id {
                        self.insert_link_once(
                            TreeKey(r.id, TreeEntity::RelationNode),
                            self.get_node_id(p.id, TreeEntity::Node),
                            self.get_node_id(m.id, TreeEntity::Node),
                            self.get_node_id(r.id, TreeEntity::Node),
                        );
                    }
                });
            })
        }

        Ok(())
    }
}
