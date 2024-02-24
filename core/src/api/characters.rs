use std::collections::HashMap;
use std::collections::HashSet;

use super::Ctx;
use super::RouterBuilder;
use crate::entity::create_file_tree;
use crate::entity::EntityType;
use crate::prisma;
use crate::prisma::canvas;
use crate::prisma::character;
use itertools::Itertools;
use nanoid::nanoid;
use rspc::Error;
use serde::Deserialize;
use serde::Serialize;

use crate::entity::Entity;



#[derive(Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
struct CreateCharacter {
    name: String,
    parent: Option<String>,
    is_collection: bool,
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
                    .entity()
                    .find_many(vec![prisma::entity::r#type::equals("character".into())])
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
        .query("list_links", |t| {
            t(|ctx: Ctx, _: ()| async move {
                ctx.client
                    .entity()
                    .find_many(vec![prisma::entity::r#type::equals("character".into())])
                    .select(prisma::entity::select!({id name}))
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
                    .entity()
                    .find_many(vec![prisma::entity::r#type::equals(EntityType::Character.to_string())]) //list of filters (empty for now because not filtering)
                    .select(Entity::select())
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
                    .find_unique(canvas::entity_id::equals(character_id))
                    .include(canvas::include!({ panels }))
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
    
        .mutation("create", |t| {
            t(|ctx: Ctx, character_details: CreateCharacter| async move {
                let CreateCharacter {
                    name,
                    //TODO: change to parentPath
                    parent,
                    is_collection,
                } = character_details;

                let id = generate_id(&name);
                let character = ctx
                    .client
                    .entity()
                    .create(
                        id.clone(),
                        name.clone(),
                        EntityType::Character.to_string(),
                        construct_path(&id, &parent.as_deref()),
                        is_collection,
                        vec![],
                    )
                    .exec()
                    .await?;

                let canvas = ctx
                    .client
                    .canvas()
                    .create(prisma::entity::id::equals(character.id.clone()), vec![])
                    .exec()
                    .await?;

                return Ok(character);
            })
        })
        .mutation("delete", |t| {
            t(|ctx: Ctx, id: String| async move {
                ctx.client
                    .entity()
                    .delete(prisma::entity::id::equals(id))
                    .exec()
                    .await
                    .unwrap()
            })
        })
}
