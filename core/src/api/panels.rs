use super::Ctx;
use crate::prisma::panel;
use rspc::RouterBuilder;
use serde::Deserialize;

panel::partial_unchecked!(TransformUpdate {
    x
    y
    width
    height
});

#[derive(Deserialize, specta::Type)]
struct PanelTransformUpdatePayload {
    id: String,
    transform: TransformUpdate,
}

pub fn panels_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new()
        .query("find", |t| {
            t(|ctx: Ctx, _: ()| async move {
                //takes no arguments
                println!("{}", "Getting panels...");
                ctx.client
                    .panel()
                    .find_many(vec![]) //list of filters (empty for now because not filtering)
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
        .mutation("transform", |t| {
            t(|ctx: Ctx, update: PanelTransformUpdatePayload| async move {
                println!("{}", "executing panel transfrom");
                ctx.client
                    .panel()
                    .update_unchecked(panel::id::equals(update.id), update.transform.to_params())
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
}