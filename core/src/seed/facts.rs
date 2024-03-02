use std::{io::Read, path::Path};

use super::{
    seedable::{SeedError, Seedable},
    EntitySeedYaml,
};
use crate::{
    entity::EntityType,
    prisma::{self, PrismaClient},
};
use async_trait::async_trait;
use serde::Deserialize;
use snafu::ResultExt;

#[derive(Debug, Deserialize)]
pub struct FactSeedYaml(pub Vec<EntitySeedYaml<FactGeneratorGroup>>);

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

pub async fn seed_facts(path: &Path, prisma: &PrismaClient) -> Result<(), snafu::Whatever> {
    let mut file = std::fs::File::open(path).expect("Unable to open file");

    let mut fact_contents = String::new();
    file.read_to_string(&mut fact_contents)
        .expect("could not read facts");
    let fact_yaml = FactSeedYaml(serde_yaml::from_str(&fact_contents).expect("could not yaml"));

    for seed_entry in fact_yaml.0 {
        for group in seed_entry.data.into_iter() {
            FactGenerator::default()
                .ensure_group(&group.name, seed_entry.entity.clone(), prisma)
                .await
                .whatever_context("Failed to create fact group for characters")?
                .get_seed_data(group.facts)
                .generate(prisma)
                .await
                .whatever_context(format!(
                    "Failed to create facts for fact group {}",
                    group.name
                ))?;
        }
    }

    Ok(())
}
