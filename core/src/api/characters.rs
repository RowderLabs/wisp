use super::Ctx;
use super::RouterBuilder;
use crate::prisma::attribute;
use crate::prisma::binder_item;
use crate::prisma::binder_path;
use crate::prisma::character_attribute;
use crate::prisma::person;
use itertools::Itertools;
use serde::Serialize;
use std::collections::HashMap;

pub fn characters_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new().query("with_id", |t| {
        t(|ctx: Ctx, id: i32| async move {
            ctx
                .client
                .person()
                .find_unique(person::id::equals(id))
                .select(person:: select!({id name attributes: select {attribute_value attribute: select {id label attribute_group}}}))
                .exec()
                .await
                .map_err(Into::into)

        })
    })
}
