use super::{Ctx, RouterBuilder};
use crate::{
    entity::{create_file_tree, entity_gen, Entity, EntityType},
    prisma::{self},
};
use serde::Deserialize;

#[derive(Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
struct CreateCharacter {
    name: String,
    parent: Option<String>,
    is_collection: bool,
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
        .query("tree", |t| {
            t(|ctx: Ctx, _: ()| async move {
                //takes no arguments
                let characters = ctx
                    .client
                    .entity()
                    .find_many(vec![prisma::entity::r#type::equals(
                        EntityType::Character.to_string(),
                    )]) //list of filters (empty for now because not filtering)
                    .select(Entity::select())
                    .exec()
                    .await
                    .unwrap();

                create_file_tree(&characters)
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

                let id = entity_gen::generate_id(&name);
                let character = ctx
                    .client
                    .entity()
                    .create(
                        id.clone(),
                        name.clone(),
                        EntityType::Character.to_string(),
                        entity_gen::construct_path(&id, &parent.as_deref()),
                        is_collection,
                        vec![],
                    )
                    .exec()
                    .await?;

                let _canvas = ctx
                    .client
                    .canvas()
                    .create(prisma::entity::id::equals(character.id.clone()), vec![])
                    .exec()
                    .await?;

                Ok(character)
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
