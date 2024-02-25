use super::Ctx;
use crate::prisma::{self};
use rspc::RouterBuilder;


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
