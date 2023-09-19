use std::collections::HashMap;

use itertools::Itertools;

use super::Ctx;
use super::RouterBuilder;
use crate::prisma::character_collection;
use crate::prisma::person;
use serde::Serialize;

character_collection::select!(binder_characters {id name path characters: select {id name}});

//newtype for creating hashmap that holds binder collection
#[derive(specta::Type, Serialize, Clone, Debug)]
pub struct BinderCollection<
    T: Clone + Serialize + specta::Type,
    E: Clone + Serialize + specta::Type,
> {
    #[serde(flatten)]
    items: HashMap<String, Vec<BinderItemType<T, E>>>,
}

//union type for binder items
#[derive(specta::Type, Serialize, Clone, Debug)]
#[serde(tag = "item_type")]
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
#[derive(Serialize, Clone, Debug, specta::Type)]
struct CharacterCollection {
    id: i32,
    name: String,
}

//partial type for character in binder
type Character = binder_characters::characters::Data;

impl Into<BinderCollection<CharacterCollection, Character>> for Vec<binder_characters::Data> {
    fn into(self) -> BinderCollection<CharacterCollection, Character> {
        let mut items: HashMap<String, Vec<BinderItemType<CharacterCollection, Character>>> =
            HashMap::new();

        for collection in self.iter() {
            let path = collection.path.clone().unwrap_or("/".to_owned());
            items
                .entry(path.clone())
                .or_default()
                .extend(collection.characters.iter().map(|c| {
                    BinderItemType::Item(BinderItem {
                        path: path.clone(),
                        data: c.clone(),
                    })
                }));
            items
                .entry(path.clone())
                .or_default()
                .push(BinderItemType::Collection(BinderItem {
                    path,
                    data: CharacterCollection {
                        id: collection.id,
                        name: collection.name.clone(),
                    },
                }));
        }
        BinderCollection { items }
    }
}

pub fn binder_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new().query("characters", |t| {
        t(|ctx: Ctx, path: Option<String>| async move {
            let collections = ctx
                .client
                .character_collection()
                .find_many(vec![character_collection::path::equals(path)])
                .select(binder_characters::select())
                .exec()
                .await?;

            let result: BinderCollection<CharacterCollection, Character> = collections.into();

            Ok(result)
        })
    })
}
