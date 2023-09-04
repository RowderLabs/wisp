#![allow(unused)]
use itertools::Itertools;
use prisma::person;

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
        TreeNode {
            id: self.id,
            parent_id: self.parent_id,
            hidden: false,
        }
    }
}


pub fn merge_children(a: person::Data, b: person::Data) -> Vec<person::Data> {
    let a_children = a
        .children
        .unwrap_or_default()
        .into_iter()
        .sorted_by(|a, b| Ord::cmp(&a.id, &b.id))
        .collect_vec();
    let b_children = b
        .children
        .unwrap_or_default()
        .into_iter()
        .sorted_by(|a, b| Ord::cmp(&a.id, &b.id))
        .collect_vec();

    std::iter::zip(a_children, b_children)
        .map_while(|(a, b)| Some(a.clone()))
        .collect_vec()
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
