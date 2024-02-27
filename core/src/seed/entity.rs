use std::{
    collections::{HashMap, HashSet},
    error::Error,
    io::Read,
    path::Path,
};

use crate::{
    entity::{entity_gen, Entity, EntityType},
    prisma::{self, fact, fact_slice, PrismaClient},
};
use async_trait::async_trait;
use itertools::Itertools;
use petgraph::graph::{self, NodeIndex};
use prisma_client_rust::queries;
use serde::{Deserialize, Serialize};
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
}


#[async_trait]
pub trait Seedable<T: Sized> {
    async fn generate(&self, client: &PrismaClient) -> Result<(), SeedError>;

    fn get_seed_data(self, data: Vec<T>) -> Self;
}
