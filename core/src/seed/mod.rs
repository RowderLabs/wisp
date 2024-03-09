use crate::{
    entity::{entity_gen, EntityType},
    prisma::{self},
};
use serde::Deserialize;
use std::path::Path;



pub mod entity;
pub mod entity_tag;
pub mod facts;
pub mod seedable;

#[derive(Debug, Deserialize)]
pub struct EntitySeedYaml<T> {
    entity: EntityType,
    data: Vec<T>,
}

pub async fn seed(prisma: &prisma::PrismaClient, _seed_path: &Path) {
    //reset db
    
    let characters_id = entity_gen::generate_id("Characters");
    let _characters = prisma
        .entity()
        .create(
            characters_id.clone(),
            "Characters".into(),
            EntityType::Anchor.to_string(),
            entity_gen::construct_path(&characters_id, &None),
            true,
            vec![],
        )
        .exec()
        .await
        .unwrap();


    let locations_id = entity_gen::generate_id("Locations");
     prisma
        .entity()
        .create(
            locations_id.clone(),
            "Locations".to_string(),
            EntityType::Anchor.to_string(),
            entity_gen::construct_path(&locations_id, &None),
            true,
            vec![],
        )
        .exec()
        .await
        .unwrap();

     let magic_systems_id = entity_gen::generate_id("Magic Systems");
     prisma
        .entity()
        .create(
            magic_systems_id.clone(),
            "Magic Systems".to_string(),
            EntityType::Anchor.to_string(),
            entity_gen::construct_path(&magic_systems_id, &None),
            true,
            vec![],
        )
        .exec()
        .await
        .unwrap();
    
    


}
