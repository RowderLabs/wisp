pub mod family_tree;

pub trait Tree<T: Sized, E: Clone + Sized> {
    fn new() -> Self;
    fn into_tree_data(self) -> TreeData<E>;
    fn create_level(&mut self, data: &Vec<T>);
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
pub struct TreeNode<T: Clone + Sized> {
    id: String,
    parent_id: Option<String>,
    hidden: bool,
    data: Option<T>
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
enum TreeEntity {
    Relation,
    Person,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct TreeKey(i32, TreeEntity);

#[derive(Debug)]
pub struct TreeData<T: Clone + Sized> {
    nodes: Vec<TreeNode<T>>,
    links: Vec<TreeLink>,
}