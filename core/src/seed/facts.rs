use async_trait::async_trait;
use serde::Deserialize;

use super::entity::{SeedError, Seedable};
use super::EntitySeedYaml;
use crate::{
    entity::EntityType,
    prisma::{self, PrismaClient},
};

#[derive(Debug, Deserialize)]
pub struct FactSeedYaml(pub EntitySeedYaml<Vec<FactGeneratorGroup>>);

#[derive(Debug, Deserialize)]
pub struct FactGeneratorGroup {
    pub name: String,
    pub facts: Vec<FactGeneratorEntry>,
}

#[derive(Default, Debug)]
pub struct FactGenerator {
    seed_data: Vec<FactGeneratorEntry>,
    group_id: Option<i32>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "lowercase")]
pub enum FactTypeLiteral {
    Text,
    Attr { options: Vec<String> },
}

impl ToString for FactTypeLiteral {
    fn to_string(&self) -> String {
        match self {
            FactTypeLiteral::Text => "text".to_string(),
            FactTypeLiteral::Attr { options: _ } => "attr".to_string(),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct FactGeneratorEntry {
    pub name: String,
    #[serde(rename = "type")]
    pub r#type: FactTypeLiteral,
}

impl FactGenerator {
    pub async fn ensure_group(
        self,
        name: &str,
        entity_type: EntityType,
        client: &PrismaClient,
    ) -> Result<Self, SeedError> {
        let group = client
            .fact_group()
            .upsert(
                prisma::fact_group::name_entity(name.to_string(), entity_type.to_string()),
                prisma::fact_group::create(entity_type.to_string(), name.to_string(), vec![]),
                vec![],
            )
            .exec()
            .await?;

        Ok(FactGenerator {
            seed_data: self.seed_data,
            group_id: Some(group.id),
        })
    }
}

#[async_trait]
impl Seedable<FactGeneratorEntry> for FactGenerator {
    async fn generate(&self, client: &PrismaClient) -> Result<(), SeedError> {
        if let Some(group_id) = self.group_id {
            let mut queries = vec![];
            for fact in self.seed_data.iter() {
                match &fact.r#type {
                    FactTypeLiteral::Text => {
                        queries.push(client.fact().create(
                            fact.name.to_string(),
                            fact.r#type.to_string(),
                            prisma::fact_group::id::equals(group_id),
                            vec![],
                        ));
                    }
                    FactTypeLiteral::Attr { options } => {
                        queries.push(client.fact().create(
                            fact.name.to_string(),
                            fact.r#type.to_string(),
                            prisma::fact_group::id::equals(group_id),
                            vec![prisma::fact::options::set(Some(serde_json::to_string(
                                &options,
                            )?))],
                        ));
                    }
                }
            }
            client._batch(queries).await?;
        }

        Ok(())
    }

    fn get_seed_data(self, data: Vec<FactGeneratorEntry>) -> Self {
        FactGenerator {
            seed_data: data,
            ..self
        }
    }
}
