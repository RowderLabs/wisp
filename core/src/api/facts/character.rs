use itertools::Itertools;
use prisma_client_rust::exec;
use rspc::RouterBuilder;
use serde::{Deserialize, Serialize};

use crate::fact::{Fact, FactValue, FactEntry};
use crate::prisma::{self, fact, fact_group, fact_slice};

use self::raw_character_fact::character_facts::Data;

use super::Ctx;

prisma::fact::select!(raw_character_fact {name r#type options group: select {name} character_facts: select {value}});


impl From<raw_character_fact::Data> for Fact {
    fn from(data: raw_character_fact::Data) -> Self {
        match data.r#type.as_str() {
            "text" => Fact::Text {
                name: data.name,
                value: data
                    .character_facts
                    .first()
                    .map(|entry| entry.value.to_owned())
                    .unwrap_or_else(|| String::new()),
                group_name: data.group.name,
            },
            "attr" => Fact::Attr {
                name: data.name,
                value: data
                    .character_facts
                    .first()
                    .map(|entry| {
                        serde_json::from_str(&data.options.clone().unwrap_or_default())
                            .unwrap_or(vec![])
                    })
                    .unwrap_or_default(),
                options: serde_json::from_str(&data.options.unwrap_or_default()).unwrap_or(vec![]),
                group_name: data.group.name,
            },
            _ => panic!("Unknown fact!"),
        }
    }
}

#[derive(Debug, Deserialize, specta::Type)]
struct FactFilters {
    group: Option<String>,
}

#[derive(Debug, Deserialize, specta::Type)]
struct FactFormPayload {
    entity_id: String,
    fields: Vec<FactEntry>,
}

#[derive(Debug, Deserialize, specta::Type)]
struct FactSlicePayload {
    slice_id: i32,
    entity_id: String,
}


pub fn character_facts_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new()
        .query("list", |t| {
            #[derive(Debug, Deserialize, specta::Type)]
            struct FactListPayload {
                id: String,
                group: Option<String>,
            }

            t(|ctx: Ctx, payload: FactListPayload| async move {
                //takes no arguments
                let group_filter = payload
                    .group
                    .map(|group| vec![fact::group::is(vec![fact_group::name::equals(group)])])
                    .unwrap_or_default();

                Ok(ctx
                    .client
                    .fact()
                    .find_many(group_filter)
                    .select(raw_character_fact::select())
                    .exec()
                    .await
                    .map_err(|e| rspc::Error::with_cause(rspc::ErrorCode::InternalServerError, "Uh oh".into(), e))?
                    .into_iter()
                    .map(|fact| Fact::from(fact))
                    .collect_vec())
            })
        })
        .query("slice", |t| {
            t(|ctx: Ctx, payload: FactSlicePayload| async move {
                #[derive(Debug, Deserialize, Serialize, specta::Type)]
                struct CharacterFactSlice {
                    name: String,
                    facts: Vec<Fact>,
                }

                let maybe_slice = ctx
                    .client
                    .fact_slice()
                    .find_unique(prisma::fact_slice::id::equals(payload.slice_id))
                    .exec()
                    .await?;

                if let Some(slice) = maybe_slice {
                    let facts = ctx
                        .client
                        .fact()
                        .find_many(vec![fact::slices::some(vec![
                            prisma::fact_slice::id::equals(slice.id),
                        ])])
                        .select(raw_character_fact::select())
                        .exec()
                        .await
                        .unwrap()
                        .into_iter()
                        .map(|fact| fact.into())
                        .collect_vec();

                    return Ok(CharacterFactSlice {
                        name: slice.name,
                        facts,
                    });
                }

                Err(rspc::Error::new(
                    rspc::ErrorCode::NotFound,
                    format!("slice with id {} not found", payload.slice_id),
                ))
            })
        })
        .mutation("update_many", |t| {
            t(|ctx: Ctx, payload: FactFormPayload| async move {
                for entry in payload.fields {
                    ctx.client
                        .fact_on_character()
                        .upsert(
                            prisma::fact_on_character::character_id_fact_name(
                                payload.entity_id.clone(),
                                entry.name.clone(),
                            ),
                            prisma::fact_on_character::create(
                                entry.value.clone().into(),
                                prisma::character::id::equals(payload.entity_id.clone()),
                                prisma::fact::name::equals(entry.name),
                                vec![],
                            ),
                            vec![prisma::fact_on_character::value::set(entry.value.into())],
                        )
                        .exec()
                        .await?;
                }

                let updated_facts: Vec<Fact> = ctx
                    .client
                    .fact()
                    .find_many(vec![])
                    .select(raw_character_fact::select())
                    .exec()
                    .await
                    .unwrap()
                    .into_iter()
                    .map(|fact| fact.into())
                    .collect();

                Ok(updated_facts)
            })
        })
}
