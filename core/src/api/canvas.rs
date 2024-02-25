use super::Ctx;
use crate::prisma::canvas;
use rspc::RouterBuilder;


pub fn canvas_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new().query("for_entity", |t| {
        t(|ctx: Ctx, entity_id: String| async move {
            //takes no arguments
            ctx.client
                .canvas()
                .find_unique(canvas::entity_id::equals(entity_id))
                .include(canvas::include!({ panels }))
                .exec()
                .await
                .map_err(Into::into)
        })
    })
}
