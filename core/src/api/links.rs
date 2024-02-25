use super::Ctx;
use crate::prisma::{self, canvas, panel};
use rspc::RouterBuilder;
use serde::Deserialize;

pub fn links_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new().query("all", |t| {
        t(|ctx: Ctx, _: ()| async move {
            ctx.client
                .entity()
                .find_many(vec![])
                .select(prisma::entity::select!({id name}))
                .exec()
                .await
                .map_err(Into::into)
        })
    })
}
