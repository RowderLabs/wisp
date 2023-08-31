#![allow(unused)]

pub mod prisma;

enum RelationshipType {
    Marriage(bool),
    Affair,
}

#[derive(Debug, Clone)]
pub struct TreeLinkData {
    id: i32,
}

#[derive(Debug, Clone)]
pub struct TreeLink {
    source: TreeLinkData,
    target: TreeLinkData,
}

impl Into<TreeNode> for prisma::person::Data {
    fn into(self) -> TreeNode {
        TreeNode { id: self.id, parent_id: self.parent_id, hidden: false}
    }
}

impl Into<TreeLink> for prisma::relationship::Data {
    fn into(self) -> TreeLink {
        TreeLink { source: TreeLinkData { id: self.source_id }, target: TreeLinkData {id: self.target_id} }
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

#[cfg(test)]
mod tests {
    use super::*;


    #[test]
    fn it_works() {
        //get list of people
    }
}
