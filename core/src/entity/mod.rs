use std::str::FromStr;

use serde::{Deserialize, Serialize};

use crate::prisma;

prisma::entity::select!(min_entity {id path name r#type is_collection});

#[derive(Serialize, Deserialize, specta::Type)]
struct Entity {
    id: String,
    path: String,
    name: String,
    r#type: String,
    is_collection: bool,
}

#[derive(Serialize, Deserialize, specta::Type)]
pub enum EntityType {
    #[serde(rename = "characters")]
    Character(Entity),
    #[serde(rename = "place")]
    Place(Entity),
}

impl Entity {
    fn to_entity_type(self) -> EntityType {
        match self.r#type.as_str() {
            "character" => EntityType::Character(self),
            _ => panic!("Unknown entity!")
        }
    }
}

impl Into<Entity> for min_entity::Data {
    fn into(self) -> Entity {
        Entity {
            id: self.id,
            path: self.path,
            name: self.name,
            r#type: self.r#type,
            is_collection: self.is_collection,
        }
    }
}
