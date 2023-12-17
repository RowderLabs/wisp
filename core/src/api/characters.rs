use super::Ctx;
use super::RouterBuilder;
use crate::prisma::character;
use rspc::Error;
use serde::Deserialize;

#[derive(Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
struct CreateCharacter {
    full_name: String,
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
                let CreateCharacter { full_name } = character_details;
                ctx.client
                    .character()
                    .create(full_name.clone(), vec![])
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
