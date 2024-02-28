

use crate::{
    prisma::{PrismaClient},
};
use async_trait::async_trait;



use serde::{Deserialize};
use thiserror::Error;

#[allow(unused)]
#[derive(Deserialize, Debug, Clone)]
struct EntityGeneratorEntry {
    key: Option<String>,
    name: String,
    parent: Option<String>,
    is_collection: bool,
}

#[allow(unused)]
#[derive(Deserialize, Debug)]
struct EntityGeneratorFile {
    characters: Vec<EntityGeneratorEntry>,
}
#[derive(Default)]
pub struct EntityGenerator {}


#[derive(Error, Debug)]
pub enum SeedError {
    #[error("failed to create")]
    DatabaseError(#[from] prisma_client_rust::QueryError),
    #[error("failed to find")]
    NotFoundError,
    #[error("Failed to serialize")]
    JSONError(#[from] serde_json::Error)
}



#[async_trait]
pub trait Seedable<T: Sized> {
    async fn generate(&self, client: &PrismaClient) -> Result<(), SeedError>;

    fn get_seed_data(self, data: Vec<T>) -> Self;
}
