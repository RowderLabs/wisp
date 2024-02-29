use std::{io::Read, path::Path};

use crate::{
    entity::{entity_gen, EntityType},
    prisma::{self, PrismaClient},
    seed::{entity::Seedable, facts::FactGenerator},
};

use serde::Deserialize;
use snafu::ResultExt;

use self::{
    entity_tag::{EntityTagGenerator, EntityTagYAML},
    facts::FactSeedYaml,
};

pub mod entity;
pub mod entity_tag;
pub mod facts;

#[derive(Debug, Deserialize)]
pub struct EntitySeedYaml<T> {
    entity: EntityType,
    data: Vec<T>,
}

pub async fn seed(prisma: &prisma::PrismaClient, seed_path: &Path) {
    //reset db

    seed_facts(&seed_path.join("facts.yaml"), prisma)
        .await
        .unwrap();

    seed_tags(&seed_path.join("entity_tags.yaml"), prisma)
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

    let sage_id = entity_gen::generate_id("Sage");
    prisma
        .entity()
        .create(
            sage_id.clone(),
            "sage".to_string(),
            EntityType::Character.to_string(),
            entity_gen::construct_path(&sage_id, &Some(_characters.path.as_str())),
            false,
            vec![],
        )
        .exec()
        .await
        .unwrap();

    prisma
        .canvas()
        .create(prisma::entity::id::equals(sage_id.clone()), vec![])
        .exec()
        .await
        .unwrap();

    prisma
        .tag_on_entity()
        .create(
            prisma::entity::id::equals(sage_id),
            prisma::entity_tag::id::equals(3),
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
