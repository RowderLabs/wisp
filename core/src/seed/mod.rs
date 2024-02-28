use std::{
    collections::{HashMap, HashSet},
    error::Error,
    io::Read,
    path::Path,
};

use crate::{
    entity::{entity_gen, EntityType},
    prisma::{self, PrismaClient},
    seed::{entity::Seedable, facts::FactGenerator},
};
use async_trait::async_trait;
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use snafu::ResultExt;

use self::facts::FactSeedYaml;

pub mod entity;
pub mod facts;

#[derive(Debug, Deserialize)]
pub struct EntitySeedYaml<T> {
    pub character: T,
    pub location: T
}

pub async fn seed(prisma: &prisma::PrismaClient, seed_path: &Path) {
    //reset db

    seed_facts(&seed_path.join("facts.yaml"), prisma)
        .await
        .unwrap();

    let characters_id = entity_gen::generate_id("Characters");
    let _characters = prisma
        .entity()
        .create(
            characters_id.clone(),
            "Characters".into(),
            EntityType::Character.to_string(),
            entity_gen::construct_path(&characters_id, &None),
            true,
            vec![],
        )
        .exec()
        .await
        .unwrap();

    let locations_id = entity_gen::generate_id("locations");
    let _locations = prisma
        .entity()
        .create(
            locations_id.clone(),
            "Locations".into(),
            EntityType::Location.to_string(),
            entity_gen::construct_path(&locations_id, &None),
            true,
            vec![],
        )
        .exec()
        .await
        .unwrap();
}

pub async fn seed_facts(path: &Path, prisma: &PrismaClient) -> Result<(), snafu::Whatever> {
    let mut file = std::fs::File::open(path).expect("Unable to open file");

    let mut fact_contents = String::new();
    file.read_to_string(&mut fact_contents)
        .expect("could not read facts");
    let fact_yaml = FactSeedYaml(serde_yaml::from_str(&fact_contents).expect("could not yaml"));

    for group in fact_yaml.0.character.into_iter() {
        FactGenerator::default()
            .ensure_group(&group.name, EntityType::Character, prisma)
            .await
            .whatever_context("Failed to create fact group for characters")?
            .get_seed_data(group.facts)
            .generate(prisma)
            .await
            .whatever_context(format!("Failed to create facts for fact group {}", group.name))?;
    }

    for group in fact_yaml.0.location.into_iter() {
        FactGenerator::default()
            .ensure_group(&group.name, EntityType::Location, prisma)
            .await
            .whatever_context("Failed to create fact group for characters")?
            .get_seed_data(group.facts)
            .generate(prisma)
            .await
            .whatever_context(format!("Failed to create facts for fact group {}", group.name))?;
    }

    Ok(())
}
