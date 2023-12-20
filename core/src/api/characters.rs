use std::collections::HashMap;
use std::collections::HashSet;

use super::Ctx;
use super::RouterBuilder;
use crate::prisma;
use crate::prisma::character;
use itertools::Itertools;
use nanoid::nanoid;
use rspc::Error;
use serde::Deserialize;
use serde::Serialize;

#[derive(Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
struct CreateCharacter {
    full_name: String,
    parent: Option<String>,
    is_collection: bool,
}

#[derive(Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
struct FileTreeItem {
    id: String,
    name: String,
    is_collection: bool,
    children: Vec<String>,
}

fn create_file_tree(characters: &Vec<character::Data>) -> HashMap<String, FileTreeItem> {
    let mut graph: HashMap<String, FileTreeItem> = HashMap::new();
    let mut in_root = HashSet::new();

    for character in characters {
        let locations = character
            .path
            .trim_start_matches("/")
            .split("/")
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
                name: character.full_name.to_string(),
                children: vec![],
                is_collection: character.is_collection,
            });

            //append location to parent
            if index == locations.len() - 1 {
                let maybe_parent = locations.get(locations.len().wrapping_sub(2));
                if let Some(parent) = maybe_parent {
                    graph.entry(parent.to_string()).and_modify(|e| e.children.push(location.to_string()));
                }
            }
        }
    }
    let root = FileTreeItem {
        id: "root".to_string(),
        name: "root".to_string(),
        children: in_root.into_iter().collect_vec(),
        is_collection: true
    };
    graph.insert("root".to_string(), root);
    graph
}

pub fn construct_path(name: &str, parent_path: &Option<&str>) -> String {
    let formatted_name = name.replace(" ", "-").to_lowercase();
    if let Some(parent) = parent_path {
        return format!("/{}/{}-{}", parent, formatted_name, nanoid!(8));
    }
    format!("/{}-{}", formatted_name, nanoid!(8))
}

pub fn characters_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new()
        .query("find", |t| {
            t(|ctx: Ctx, _: ()| async move {
                //takes no arguments
                ctx.client
                    .character()
                    .find_many(vec![]) //list of filters (empty for now because not filtering)
                    .exec()
                    .await
                    .unwrap()
            })
        })
        .query("build_tree", |t| {
            t(|ctx: Ctx, _: ()| async move {
                //takes no arguments
                let characters = ctx
                    .client
                    .character()
                    .find_many(vec![]) //list of filters (empty for now because not filtering)
                    .exec()
                    .await
                    .unwrap();

                let graph = create_file_tree(&characters);
                graph
            })
        })
        .query("with_id", |t| {
            t(|ctx: Ctx, path: String| async move {
                ctx.client
                    .character()
                    .find_unique(character::path::equals(path))
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
        .mutation("create", |t| {
            t(|ctx: Ctx, character_details: CreateCharacter| async move {
                let CreateCharacter {
                    full_name,
                    parent,
                    is_collection,
                } = character_details;
                ctx.client
                    .character()
                    .create(
                        construct_path(&full_name, &parent.as_deref()),
                        full_name.clone(),
                        is_collection,
                        vec![],
                    )
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
        .mutation("delete", |t| {
            t(|ctx: Ctx, path: String| async move {
                ctx.client
                    .character()
                    .delete(character::path::equals(path))
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
}
