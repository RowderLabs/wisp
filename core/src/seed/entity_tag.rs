use super::{
    seedable::{SeedError, Seedable},
    EntitySeedYaml,
};
use async_trait::async_trait;
use serde::Deserialize;
use snafu::ResultExt;
use std::{io::Read, path::Path};

use crate::{entity::EntityType, prisma::PrismaClient};

#[derive(Debug, Deserialize)]
pub struct EntityTagYAML(pub Vec<EntitySeedYaml<String>>);

#[derive(Default, Debug)]
pub struct EntityTagGenerator {
    seed_data: Vec<String>,
    entity_type: Option<EntityType>,
}

impl EntityTagGenerator {
    pub fn entity_type(self, entity_type: EntityType) -> Self {
        Self {
            entity_type: Some(entity_type),
            ..self
        }
    }
}

#[async_trait]
impl Seedable<String> for EntityTagGenerator {
    async fn generate(&self, client: &PrismaClient) -> Result<(), SeedError> {
        let mut queries = vec![];

        if self.entity_type.is_none() {
            return Err(SeedError::NotFoundError);
        }

        for tag in self.seed_data.iter() {
            queries.push(client.entity_tag().create(
                tag.to_string(),
                self.entity_type.as_ref().unwrap().to_string(),
                vec![],
            ));
        }

        client._batch(queries).await?;

        Ok(())
    }

    fn get_seed_data(self, data: Vec<String>) -> Self {
        EntityTagGenerator {
            seed_data: data,
            ..self
        }
    }
}

pub async fn seed_tags(path: &Path, prisma: &PrismaClient) -> Result<(), snafu::Whatever> {
    let mut file = std::fs::File::open(path).expect("Unable to open file");

    let mut fact_contents = String::new();
    file.read_to_string(&mut fact_contents)
        .expect("could not read facts");
    let tags_yaml = EntityTagYAML(serde_yaml::from_str(&fact_contents).expect("could not yaml"));

    for seed_entry in tags_yaml.0 {
        EntityTagGenerator::default()
            .entity_type(seed_entry.entity)
            .get_seed_data(seed_entry.data)
            .generate(prisma)
            .await
            .whatever_context("Failed to generate seed for tags")?;
    }

    Ok(())
}
