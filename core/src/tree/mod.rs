use self::{error::TreeError, family_tree::tree_person};
use indexmap::{map::Entry, IndexMap};
use itertools::Itertools;
use nanoid::nanoid;
use snafu::ResultExt;
use std::convert::TryFrom;
use std::convert::TryInto;

pub mod error;
pub mod family_tree;

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

#[derive(Debug, Clone)]
pub struct TreeNodeWithData<T: Clone + Sized> {
    id: String,
    parent_id: Option<String>,
    hidden: bool,
    data: T,
}

#[derive(Debug, Clone)]
pub enum TreeNodeType<T: Clone + Sized> {
    Node(TreeNode),
    WithData(TreeNodeWithData<T>),
}

impl<T: Clone + Sized> TreeNodeType<T> {
    fn get_id(&self) -> String {
        match self {
            TreeNodeType::Node(inner) => inner.id.clone(),
            TreeNodeType::WithData(inner) => inner.id.clone(),
            _ => panic!("Unknown node type"),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
enum TreeEntity {
    Node,
    RelationNode,
    Link,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct TreeKey(i32, TreeEntity);

#[derive(Debug)]
pub struct TreeData<T: Clone + Sized> {
    nodes: Vec<TreeNodeType<T>>,
    links: Vec<TreeLink>,
}

impl TryInto<TreeLinkData> for Option<String> {
    type Error = TreeError;

    fn try_into(self) -> Result<TreeLinkData, Self::Error> {
        match self {
            Some(id) => Ok(TreeLinkData(id)),
            None => Err(TreeError::LinkCreationError {
                source: TreeError::NodeNotFound.into(),
            }),
        }
    }
}

trait BuildableTree<T: Clone + Sized, E: Clone + Sized> {
    fn create_level(&mut self, data: &Vec<T>) -> Result<(), TreeError>;
    fn new() -> Tree<E>;
}

struct Tree<T: Clone + Sized> {
    nodes: IndexMap<TreeKey, TreeNodeType<T>>,
    links: IndexMap<TreeKey, TreeLink>,
}

impl<T: Sized + Clone> Tree<T> {
    fn get_node_id(&self, entity_id: i32, entity_type: TreeEntity) -> Option<String> {
        let key = TreeKey(entity_id, entity_type);
        self.nodes.get(&key).map(|n| n.get_id())
    }
    pub fn insert_node_once(
        &mut self,
        key: TreeKey,
        data: Option<T>,
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
    ) -> Result<(), TreeError> {
        match self.links.entry(key) {
            Entry::Vacant(entry) => {
                let result = TreeLink {
                    source: source_id
                        .try_into()
                        .whatever_context("Failed to convert source id")?,
                    target: target_id
                        .try_into()
                        .whatever_context("Failed to convert target id")?,
                    link: link_id
                        .try_into()
                        .whatever_context("Failed to convert link id")?,
                };
                entry.insert(result);
            }
            Entry::Occupied(_) => {}
        }

        Ok(())
    }

    fn into_tree_data(self) -> TreeData<T> {
        TreeData {
            nodes: self.nodes.values().into_iter().cloned().collect_vec(),
            links: self.links.values().into_iter().cloned().collect_vec(),
        }
    }
}
