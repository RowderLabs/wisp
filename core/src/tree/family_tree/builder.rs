use itertools::Itertools;
use crate::{tree::{Tree, TreeData}, prisma::{self, person}};
use super::{FamilyTree, tree_person, FamilyTreeNodeData};


pub struct FamilyTreeBuilder {
    family_id: Option<i32>,
    parent_relation_id: Option<i32>,
    tree: FamilyTree,
}



impl FamilyTreeBuilder {
    pub fn init() -> FamilyTreeBuilder {
        FamilyTreeBuilder {
            family_id: None,
            parent_relation_id: None,
            tree: FamilyTree::new(),
        }
    }

    pub fn family(self, family_id: i32) -> Self {
        FamilyTreeBuilder {
            family_id: Some(family_id),
            ..self
        }
    }

    pub fn starting_generation(self, parent_relation_id: i32) -> Self {
        FamilyTreeBuilder {
            parent_relation_id: Some(parent_relation_id),
            ..self
        }
    }

    async fn _batch_fetch_descendants(
        &self,
        prisma: &prisma::PrismaClient,
        relation_ids: Vec<i32>,
    ) -> Vec<tree_person::Data> {
        let queries = relation_ids.iter().map(|id| {
            prisma
                .person()
                .find_many(vec![person::parent_relation_id::equals(Some(*id))])
                .select(tree_person::select())
        });
        prisma
            ._batch(queries)
            .await
            .unwrap()
            .into_iter()
            .flatten()
            .collect_vec()
    }

    async fn _fetch_descendants(
        &self,
        prisma: &prisma::PrismaClient,
        relation_id: Option<i32>,
    ) -> Vec<tree_person::Data> {
        prisma
            .person()
            .find_many(vec![person::parent_relation_id::equals(relation_id)])
            .select(tree_person::select())
            .exec()
            .await
            .unwrap()
    }

    pub async fn build(mut self, prisma: &prisma::PrismaClient) -> TreeData<FamilyTreeNodeData> {
        let mut current = self
            ._fetch_descendants(prisma, self.parent_relation_id)
            .await;

        loop {
            self.tree.create_level(&current);

            let children_ids = current
                .iter()
                .flat_map(|p| p.relationships.iter().filter(|r| r.children.len() > 0))
                .map(|r| r.id)
                .collect_vec();

            if children_ids.len() == 0 {
                break;
            }

            current = self._batch_fetch_descendants(prisma, children_ids).await;
        }

        self.tree.into_tree_data()
    }
}