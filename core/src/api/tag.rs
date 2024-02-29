use rspc::RouterBuilder;
use serde::Deserialize;

use crate::{api::Ctx, prisma};

#[derive(Deserialize, specta::Type)]
struct AddTagToEntity {
    entity_id: String,
    tag_id: i32,
}

prisma::tag_on_entity::select!(EntityTag {tag_id tag: select {name}});

pub fn entity_tag_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new()
        .query("on_entity", |t| {
            t(|ctx: Ctx, entity_id: String| async move {
                //takes no arguments
                ctx.client
                    .tag_on_entity()
                    .find_many(vec![prisma::tag_on_entity::entity_id::equals(entity_id)])
                    .select(EntityTag::select())
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
        .mutation("add", |t| {
            t(|ctx: Ctx, payload: AddTagToEntity| async move {
                let AddTagToEntity { entity_id, tag_id } = payload;

                ctx.client
                    .tag_on_entity()
                    .create(
                        prisma::entity::id::equals(entity_id),
                        prisma::entity_tag::id::equals(tag_id),
                        vec![],
                    )
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
}
