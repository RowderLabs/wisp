use std::collections::HashMap;
use std::collections::HashSet;

use super::Ctx;
use super::RouterBuilder;
use crate::prisma;
use crate::prisma::canvas;
use crate::prisma::character;
use itertools::Itertools;
use nanoid::nanoid;
use rspc::Error;
use serde::Deserialize;
use serde::Serialize;

const PATH_DELIMITER: &'static str = "/";
const ROOT_DELIMITER: &'static str = "root";

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
    path: Option<String>,
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
                name: character.full_name.to_string(),
                path: Some(character.path.to_string()),
                children: vec![],
                is_collection: character.is_collection,
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

pub fn generate_id(name: &str) -> String {
    format!("{}-{}", name.replace(" ", "-").to_lowercase(), nanoid!(8))
}

pub fn construct_path(id: &str, parent_path: &Option<&str>) -> String {
    if let Some(parent) = parent_path {
        return format!("{}/{}", parent, id);
    }
    format!("/{}", id.to_string())
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
        .query("list_links", |t| {
            t(|ctx: Ctx, _: ()| async move {
                ctx.client
                    .character()
                    .find_many(vec![])
                    .select(character::select!({id full_name}))
                    .exec()
                    .await
                    .map_err(Into::into)
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
            t(|ctx: Ctx, id: String| async move {
                ctx.client
                    .character()
                    .find_unique(character::id::equals(id))
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
        .query("canvas", |t| {
            t(|ctx: Ctx, character_id: String| async move {
                ctx.client
                    .canvas()
                    .find_unique(canvas::character_id::equals(character_id))
                    .include(canvas::include!({ panels }))
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
        .mutation("create", |t| {
            t(|ctx: Ctx, character_details: CreateCharacter| async move {
                let CreateCharacter {
                    full_name,
                    //TODO: change to parentPath
                    parent,
                    is_collection,
                } = character_details;

                let id = generate_id(&full_name);
                let character = ctx
                    .client
                    .character()
                    .create(
                        id.clone(),
                        construct_path(&id, &parent.as_deref()),
                        full_name.clone(),
                        is_collection,
                        vec![],
                    )
                    .exec()
                    .await?;

                let canvas = ctx
                    .client
                    .canvas()
                    .create(character::id::equals(character.id.clone()), vec![])
                    .exec()
                    .await?;

                return Ok(character);
            })
        })
        .mutation("delete", |t| {
            t(|ctx: Ctx, id: String| async move {
                ctx.client
                    .character()
                    .delete(character::id::equals(id))
                    .exec()
                    .await
                    .unwrap()
            })
        })
}
