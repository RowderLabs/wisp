use super::Ctx;
use crate::prisma::{self, canvas, panel};
use rspc::RouterBuilder;
use serde::Deserialize;

pub fn canvas_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new().query("get_panels", |t| {
        t(|ctx: Ctx, canvas_id: String| async move {
            //takes no arguments
            ctx.client
                .canvas()
                .find_many(vec![canvas::id::equals(canvas_id)])
                .with(canvas::panels::fetch(vec![]))
                .exec()
                .await
                .map_err(Into::into)
        })
    })
}
