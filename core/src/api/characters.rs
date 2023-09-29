use super::Ctx;
use super::RouterBuilder;
use crate::prisma::attribute;
use crate::prisma::binder_item;
use crate::prisma::binder_path;
use crate::prisma::character_attribute;
use crate::prisma::person;
use itertools::Itertools;
use nanoid::format;
use rspc::Error;
use serde::Deserialize;
use std::collections::HashMap;

#[derive(Deserialize, specta::Type)]
struct CharacterNameUpdate {
    id: i32,
    name: String,
}

#[derive(Deserialize, specta::Type)]
struct CreateCharacter {
    name: String,
    path_id: Option<i32>,
}

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
    }).mutation("change_name", |t| {
        t(|ctx: Ctx, update: CharacterNameUpdate| async move {
            ctx.client.person().update(person::id::equals(update.id), vec![person::name::set(update.name)]).exec().await.map_err(Into::into)
        })
    }).mutation("create", |t| {
        t(|ctx: Ctx, create_opts: CreateCharacter| async move {
            let character = ctx.client.person().create(create_opts.name.clone(), vec![]).exec().await.map_err(|err| {Error::with_cause(rspc::ErrorCode::BadRequest, format!("Character with name {} already exists.", create_opts.name), err)})?;
            let test = ctx.client.person().find_many(vec![person::name::equals("Sage".into())]).exec().await?;
            println!("{:?}", test);
            let path = ctx.client.binder_path().find_unique(binder_path::id::equals(create_opts.path_id.unwrap_or(1))).exec().await?.unwrap();

            let character_path = ctx.client.binder_path().create(format!("{}/{}", path.path, path.id), vec![binder_path::parent::connect(binder_path::id::equals(path.id))]).exec().await?;
            ctx.client.binder_item().create(vec![binder_item::binder_path::connect(binder_path::id::equals(character_path.id)), binder_item::character::connect(person::id::equals(character.id))]).exec().await?;


            Ok(())

        })
    }).mutation("delete_with_name", |t| {
        t(|ctx: Ctx, name: String| async move {
            ctx.client.person().delete(person::name::equals(name.clone())).exec().await.map_err(|err| rspc::Error::with_cause(rspc::ErrorCode::BadRequest, format!("Could not delete character {}, since they do not exist.", name), err))
        })
    })
}