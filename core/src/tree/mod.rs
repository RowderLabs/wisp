pub mod family_tree;
pub mod error;

pub trait Tree<T: Sized, E: Clone + Sized> {
    fn new() -> Self;
    fn into_tree_data(self) -> TreeData<E>;
    fn create_level(&mut self, data: &Vec<T>) -> Result<(), error::TreeError>;
}


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
    data: T
}


#[derive(Debug, Clone)]
pub enum TreeNodeType<T: Clone + Sized> {
    Node(TreeNode),
    WithData(TreeNodeWithData<T>)
}

impl <T: Clone + Sized> TreeNodeType<T> {
    fn get_id(&self) -> String {
        match self {
            TreeNodeType::Node(inner) => inner.id.clone(),
            TreeNodeType::WithData(inner) => inner.id.clone(),
            _ => panic!("Unknown node type")
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
enum TreeEntity {
    Relation,
    Person,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct TreeKey(i32, TreeEntity);

#[derive(Debug)]
pub struct TreeData<T: Clone + Sized> {
    nodes: Vec<TreeNodeType<T>>,
    links: Vec<TreeLink>,
}