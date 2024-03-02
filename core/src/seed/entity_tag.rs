use async_trait::async_trait;
use serde::Deserialize;

use super::{
    entity::{SeedError, Seedable},
    EntitySeedYaml,
};
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
