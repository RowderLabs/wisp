use super::Ctx;
use crate::prisma::person;
use super::RouterBuilder;


pub fn binder_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new().query("characters", |t| {
        t(|ctx: Ctx, _: ()| async move {
            ctx.client
                .person()
                .find_many(vec![])
                .select(person::select!({id name}))
                .exec()
                .await
                .unwrap()
        })
    })
}
