use super::{tree_person, FamilyTree, FamilyTreeNodeData};
use crate::{
    prisma::{self, person},
    tree::{Tree, TreeData},
};
use itertools::Itertools;
use snafu::{OptionExt, ResultExt, Whatever, whatever, ensure};

pub struct FamilyTreeBuilder {
    root_id: Option<i32>,
    family_id: Option<i32>,
    tree: FamilyTree,
}

impl FamilyTreeBuilder {
    pub fn init() -> FamilyTreeBuilder {
        FamilyTreeBuilder {
            family_id: None,
            root_id: None,
            tree: FamilyTree::new(),
        }
    }

    pub fn root(self, root_id: i32) -> Self {
        FamilyTreeBuilder {
            root_id: Some(root_id),
            ..self
        }
    }

    pub fn family(self, family_id: i32) -> Self {
        FamilyTreeBuilder {
            family_id: Some(family_id),
            ..self
        }
    }

    async fn _batch_fetch_descendants(
        &self,
        prisma: &prisma::PrismaClient,
        relation_ids: Vec<i32>,
    ) -> Result<Vec<tree_person::Data>, Whatever> {
        let queries = relation_ids.iter().map(|id| {
            prisma
                .person()
                .find_many(vec![person::parent_relation_id::equals(Some(*id))])
                .select(tree_person::select())
        });

        Ok(prisma
            ._batch(queries)
            .await
            .whatever_context("Failed to fetch nested tree descendants")?
            .into_iter()
            .flatten()
            .collect_vec())
    }

    async fn _fetch_descendants(
        &self,
        prisma: &prisma::PrismaClient,
    ) -> Result<Vec<tree_person::Data>, Whatever> {

        if (self.root_id.is_none() && self.family_id.is_none()) {
            whatever!("No root id or family id");
        }

        let result = prisma
            .person()
            .find_many(vec![
                person::parent_relation_id::equals(self.root_id),
                person::family_id::equals(self.family_id),
            ])
            .select(tree_person::select())
            .exec()
            .await
            .whatever_context("Failed to fetch root tree descendants")?;

            if result.len() == 0 {
                whatever!("No data to contruct tree from");
            }
            Ok(result)

    }

    pub async fn build(
        mut self,
        prisma: &prisma::PrismaClient,
    ) -> Result<TreeData<FamilyTreeNodeData>, snafu::Whatever> {
        let mut current = self._fetch_descendants(prisma).await?;

        loop {
            self.tree
                .create_level(&current)
                .whatever_context("cant buildy tree")?;

            let children_ids = current
                .iter()
                .flat_map(|p| p.relationships.iter().filter(|r| r.children.len() > 0))
                .map(|r| r.id)
                .collect_vec();

            if children_ids.len() == 0 {
                break;
            }

            current = self._batch_fetch_descendants(prisma, children_ids).await?;
        }

        Ok(self.tree.into_tree_data())
    }
}
