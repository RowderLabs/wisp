use crate::{
    entity::{entity_gen, EntityType},
    prisma::{self},
};
use serde::Deserialize;
use std::path::Path;

use self::{entity_tag::seed_tags, facts::seed_facts};

pub mod entity;
pub mod entity_tag;
pub mod facts;
pub mod seedable;

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
