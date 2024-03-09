use super::Ctx;
use crate::{
    entity::{entity_gen, EntityType},
    prisma::{self},
};
use rspc::RouterBuilder;
use serde::Deserialize;

#[derive(Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct CreateEntity {
    pub name: String,
    pub parent: Option<String>,
    pub r#type: EntityType,
    pub is_collection: bool,
}

pub fn entity_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new()
        .query("get", |t| {
            t(|ctx: Ctx, entity_id: String| async move {
                ctx.client
                    .entity()
                    .find_unique(prisma::entity::id::equals(entity_id))
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
        .mutation("create", |t| {
            t(|ctx: Ctx, payload: CreateEntity| async move {
                let CreateEntity {
                    name,
                    r#type,
                    parent,
                    is_collection,
                } = payload;

                let id = entity_gen::generate_id(&name);
                let entity = ctx
                    .client
                    .entity()
                    .create(
                        id.clone(),
                        name.clone(),
                        r#type.to_string(),
                        entity_gen::construct_path(&id, &parent.as_deref()),
                        is_collection,
                        vec![],
                    )
                    .exec()
                    .await?;

                let _canvas = ctx
                    .client
                    .canvas()
                    .create(prisma::entity::id::equals(entity.id.clone()), vec![])
                    .exec()
                    .await?;

                Ok(entity)
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
