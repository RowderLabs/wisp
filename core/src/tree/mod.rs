use self::{error::TreeError, family_tree::tree_person};
use indexmap::{map::Entry, IndexMap};
use itertools::Itertools;
use nanoid::nanoid;
use serde::Serialize;
use snafu::ResultExt;
use std::convert::TryFrom;
use std::convert::TryInto;

pub mod error;
pub mod family_tree;

#[derive(Debug, Clone, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct TreeLinkData(String);

#[derive(Debug, Clone, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct TreeLink {
    pub source: TreeLinkData,
    pub target: TreeLinkData,
    pub link: TreeLinkData,
}

#[derive(Debug, Clone, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct TreeNode {
    pub id: String,
    pub parent_id: Option<String>,
    pub hidden: bool,
}

#[derive(Debug, Clone, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct TreeNodeWithData<T> where T: Clone + Serialize + specta::Type + specta::Flatten {
    pub id: String,
    pub parent_id: Option<String>,
    pub hidden: bool,
    #[serde(flatten)]
    pub data: T,
}

#[derive(Debug, Clone, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
#[serde(untagged)]
pub enum TreeNodeType<T> where T: Clone + Serialize + specta::Type + specta::Flatten {
    Node(TreeNode),
    WithData(TreeNodeWithData<T>),
}

impl<T: Clone + Serialize + specta::Type + specta::Flatten> TreeNodeType<T> {
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

#[derive(Debug, Clone, Serialize, specta::Type)]
pub struct TreeData<T> where T: Clone + Serialize + specta::Type + specta::Flatten {
    pub nodes: Vec<TreeNodeType<T>>,
    pub links: Vec<TreeLink>,
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

pub trait BuildableTree<T: Clone, E: Clone + Serialize + specta::Type + specta::Flatten> {
    fn create_level(&mut self, data: &Vec<T>) -> Result<(), TreeError>;
    fn new() -> Tree<E>;
}

pub struct Tree<T> where T: Clone + Serialize + specta::Type + specta::Flatten {
    nodes: IndexMap<TreeKey, TreeNodeType<T>>,
    links: IndexMap<TreeKey, TreeLink>,
}

impl<T: Clone + Serialize + specta::Type + specta::Flatten> Tree<T> {
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

    pub fn into_tree_data(self) -> TreeData<T> {
        TreeData {
            nodes: self.nodes.values().into_iter().cloned().collect_vec(),
            links: self.links.values().into_iter().cloned().collect_vec(),
        }
    }
}
