use itertools::Itertools;

use crate::{
    prisma::{self, person, relationship},
    TreeData, TreeLink, TreeNode,
};
use std::collections::HashSet;

pub struct TreeBuilder {
    seen: HashSet<i32>,
    nodes: Vec<TreeNode>,
    links: Vec<TreeLink>,
}

impl TreeBuilder {
    pub fn init() -> TreeBuilder {
        TreeBuilder {
            seen: HashSet::new(),
            nodes: Vec::new(),
            links: Vec::new(),
        }
    }

    pub async fn build(mut self, prisma: &prisma::PrismaClient) -> TreeData {
        let mut current = self._build_root(prisma).await;

        loop {
            let (nodes, next) = Self::_build_generation(&mut current);
            self.nodes.extend(nodes);

            let next_generation = next.iter().map(|id| {
                prisma
                    .person()
                    .find_many(vec![person::parent_relation_id::equals(Some(*id))])
                    .with(
                        person::relationships::fetch(vec![])
                            .with(relationship::members::fetch(vec![]))
                            .with(relationship::children::fetch(vec![])),
                    )
            });

            if next_generation.len() == 0 {
                break;
            }

            current = prisma
                ._batch(next_generation)
                .await
                .unwrap()
                .into_iter()
                .flatten()
                .collect_vec();
        }

        TreeData {
            nodes: self.nodes,
            links: self.links,
        }
    }

    async fn _build_root(&mut self, prisma: &prisma::PrismaClient) -> Vec<person::Data> {
        self.nodes.push(TreeNode {
            id: 0,
            parent_id: None,
            hidden: true,
        });
        let first_gen = prisma
            .person()
            .find_many(vec![person::family_id::equals(Some(1))])
            .with(
                person::relationships::fetch(vec![])
                    .with(relationship::members::fetch(vec![]))
                    .with(relationship::children::fetch(vec![])),
            )
            .exec()
            .await
            .unwrap();
        first_gen
    }

    pub fn _build_generation(data: &mut Vec<person::Data>) -> (Vec<TreeNode>, Vec<i32>) {
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
