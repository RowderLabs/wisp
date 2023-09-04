#![allow(unused)]
use std::collections::HashSet;

use itertools::Itertools;
use prisma::{person, relationship};
pub mod prisma;
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

impl TreeData {
    pub fn build_generation(data: &mut Vec<person::Data>) -> (Vec<TreeNode>, Vec<i32>) {
        let mut nodes = vec![];
        let mut relations_with_children = vec![];
        data.into_iter().for_each(|p| {
            //push person
            nodes.push(TreeNode {
                id: p.id,
                parent_id: Some(0),
                hidden: false,
            });
            let relations = p.relationships.clone().unwrap_or_default();
            //if relationships push members
            if relations.len() > 0 {
                relations.into_iter().for_each(|r| {
                    let members = r.members.unwrap_or_default();
                    let shared_children = r.children.unwrap_or_default();
                    if members.len() > 0 {
                        members.into_iter().for_each(|m| {
                            if m.id != p.id {
                                nodes.push(TreeNode {
                                    id: m.id,
                                    parent_id: Some(0),
                                    hidden: false,
                                })
                            }
                        })
                    }

                    if shared_children.len() > 0 {
                        relations_with_children.push(r.id)
                    }
                })
            }
        });
        (nodes, relations_with_children)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        //get list of people
    }
}
