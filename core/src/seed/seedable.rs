use crate::prisma::PrismaClient;
use async_trait::async_trait;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum SeedError {
    #[error("failed to create")]
    DatabaseError(#[from] prisma_client_rust::QueryError),
    #[error("failed to find")]
    NotFoundError,
    #[error("Failed to serialize")]
    JSONError(#[from] serde_json::Error),
}

#[async_trait]
pub trait Seedable<T: Sized> {
    async fn generate(&self, client: &PrismaClient) -> Result<(), SeedError>;

    fn get_seed_data(self, data: Vec<T>) -> Self;
}
