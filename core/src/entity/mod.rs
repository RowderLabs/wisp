use std::collections::{HashMap, HashSet};
use itertools::Itertools;
use serde::{Deserialize, Serialize};


use crate::prisma;

prisma::entity::select!(Entity {id path name r#type is_collection});

#[derive(Serialize, Deserialize, specta::Type, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub enum EntityType {
    Character,
    Location,
}

impl ToString for EntityType {
    fn to_string(&self) -> String {
        match self {
            EntityType::Character => "character".to_string(),
            EntityType::Location => "location".to_string(),
        }
    }
}

#[derive(Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct FileTreeItem {
    pub id: String,
    pub path: Option<String>,
    pub name: String,
    pub is_collection: bool,
    pub children: Vec<String>,
}

const PATH_DELIMITER: &str = "/";
const ROOT_DELIMITER: &str = "root";

pub fn create_file_tree(entities: &Vec<Entity::Data>) -> HashMap<String, FileTreeItem> {
    let mut graph: HashMap<String, FileTreeItem> = HashMap::new();
    let mut in_root = HashSet::new();

    for entity in entities {
        let locations = entity
            .path
            .trim_start_matches(PATH_DELIMITER)
            .split(PATH_DELIMITER)
            .collect_vec();

        //add location to root node
        if locations.len() == 1 {
            if let Some(location) = locations.first() {
                in_root.insert(location.to_string());
            }
        }

        for (index, location) in locations.iter().enumerate() {
            //append location to graph
            graph.entry(location.to_string()).or_insert(FileTreeItem {
                id: location.to_string(),
                name: entity.name.to_string(),
                path: Some(entity.path.to_string()),
                children: vec![],
                is_collection: entity.is_collection,
            });

            //append location to parent
            if index == locations.len() - 1 {
                let maybe_parent = locations.get(locations.len().wrapping_sub(2));
                if let Some(parent) = maybe_parent {
                    graph
                        .entry(parent.to_string())
                        .and_modify(|e| e.children.push(location.to_string()));
                }
            }
        }
    }
    let root = FileTreeItem {
        id: ROOT_DELIMITER.to_owned(),
        name: ROOT_DELIMITER.to_owned(),
        path: None,
        children: in_root.into_iter().collect_vec(),
        is_collection: true,
    };
    graph.insert("root".to_string(), root);
    graph
}

pub mod entity_gen {
    pub fn generate_id(name: &str) -> String {
        format!("{}-{}", name.replace(' ', "-").to_lowercase(), nanoid::nanoid!(5))
    }

    pub fn construct_path(id: &str, parent_path: &Option<&str>) -> String {
        if let Some(parent) = parent_path {
            return format!("{}/{}", parent, id);
        }
        format!("/{}", id.to_string())
    }
}
