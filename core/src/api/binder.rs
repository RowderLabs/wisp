use std::collections::HashMap;

use itertools::Itertools;

use super::Ctx;
use super::RouterBuilder;
use crate::prisma::binder_item;
use crate::prisma::person;
use serde::Serialize;

//newtype for creating hashmap that holds binder collection
#[derive(specta::Type, Serialize, Clone, Debug)]
pub struct BinderCollection<
    T: Clone + Serialize + specta::Type,
    E: Clone + Serialize + specta::Type,
> {
    items: HashMap<String, Vec<BinderItemType<T, E>>>,
}

//union type for binder items
#[derive(specta::Type, Serialize, Clone, Debug)]
#[serde(tag = "type")]
#[serde(rename_all = "camelCase")]
pub enum BinderItemType<T: Clone + Serialize + specta::Type, E: Clone + Serialize + specta::Type> {
    Collection(BinderItem<T>),
    Item(BinderItem<E>),
}

//generic item that appears in the binder
#[derive(Serialize, Clone, Debug, specta::Type)]
pub struct BinderItem<T: Clone + Serialize + specta::Type> {
    path: String,
    data: T,
}

//partial type of binder characters query

pub fn binder_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new().query("characters", |t| {
        t(|ctx: Ctx, path: Option<String>| async move {

            let test = ctx.client.binder_item().find_unique(binder_item::id::equals(2)).exec().await.unwrap();
            ctx.client
                .binder_item()
                .find_many(vec![binder_item::path::starts_with("/characters".into())])
                .include(binder_item::include!({character: select {id name} item_paths}))
                .exec()
                .await
                .map_err(Into::into)
        })
    })
}
