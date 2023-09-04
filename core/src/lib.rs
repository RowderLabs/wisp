#![allow(unused)]
use std::collections::HashSet;

use itertools::Itertools;
use prisma::{person, relationship};
pub mod prisma;
pub mod tree;
pub mod seed;

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
