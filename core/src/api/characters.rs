use std::collections::HashMap;

use super::Ctx;
use super::RouterBuilder;
use crate::prisma;
use crate::prisma::character;
use itertools::Itertools;
use rspc::Error;
use serde::Deserialize;
use serde::Serialize;

#[derive(Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
struct CreateCharacter {
    full_name: String,
    path: String,
}

#[derive(Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
struct FileTreeItem {
    id: String,
    name: String,
    children: Vec<String>,
}
fn create_adjacency_list(characters: Vec<character::Data>) -> HashMap<String, FileTreeItem> {
    let mut graph: HashMap<String, FileTreeItem> = HashMap::new();

    // Populate the tree
    for character in characters {
        let components: Vec<&str> = character.path.trim_start_matches('/').split('/').collect();

        for i in 0..components.len() {
            let node_id = components[0..=i].join("/");
            graph.entry(node_id.clone()).or_insert(FileTreeItem {
                id: node_id.clone(),
                name: character.full_name.to_string(),
                children: Vec::new(),
            });

            if i < components.len() - 1 {
                let child_id = components[0..=i + 1].join("/");
                graph.get_mut(&node_id).unwrap().children.push(child_id);
            }
        }
    }

    graph
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

                let graph = create_adjacency_list(characters);
                graph
            })
        })
        .query("with_id", |t| {
            t(|ctx: Ctx, id: i32| async move {
                ctx.client
                    .character()
                    .find_unique(character::id::equals(id))
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
        .mutation("create", |t| {
            t(|ctx: Ctx, character_details: CreateCharacter| async move {
                let CreateCharacter { full_name, path } = character_details;
                ctx.client
                    .character()
                    .create(full_name.clone(), path, vec![])
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
        .mutation("delete", |t| {
            t(|ctx: Ctx, id: i32| async move {
                ctx.client
                    .character()
                    .delete(character::id::equals(id))
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
}
