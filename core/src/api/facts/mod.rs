use super::Ctx;
use crate::entity::EntityType;
use crate::fact::{Fact, FactEntry, FactSlice};
use crate::prisma;
use itertools::Itertools;
use rspc::RouterBuilder;
use serde::Deserialize;

prisma::fact_on_entity::select!((filters: Vec<prisma::fact_on_entity::WhereParam>) => DbFactValue {value });

//selects all facts for an entity with
prisma::fact::select!(
    (entity_id: String) => FactWithValues {
        name r#type options group: select {
            name
        }
        entity_facts(
            vec![prisma::fact_on_entity::entity_id::equals(entity_id)]
        ): select {
            value
        }
    }
);

impl From<FactWithValues::Data> for Fact {
    fn from(data: FactWithValues::Data) -> Self {
        match data.r#type.as_str() {
            "text" => Fact::Text {
                name: data.name,
                value: data
                    .entity_facts
                    .first()
                    .map(|entry| entry.value.to_owned())
                    .unwrap_or_else(String::new),
                group_name: data.group.name,
            },
            "attr" => Fact::Attr {
                name: data.name,
                value: data
                    .entity_facts
                    .first()
                    .map(|_entry| {
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
#[serde(rename_all = "camelCase")]
struct FactFilters {
    group_id: i32,
    entity_id: String,
}

#[derive(Debug, Deserialize, specta::Type)]
struct FactSlicePayload {
    slice_id: i32,
    entity_id: String,
}

#[derive(Debug, Deserialize, specta::Type)]
struct FactFormPayload {
    entity_id: String,
    fields: Vec<FactEntry>,
}

pub fn facts_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new()
        .query("on_entity", |t| {
            t(|ctx: Ctx, payload: FactFilters| async move {
                Ok(ctx
                    .client
                    .fact()
                    .find_many(vec![prisma::fact::group::is(vec![
                        prisma::fact_group::id::equals(payload.group_id),
                    ])])
                    .select(FactWithValues::select(payload.entity_id))
                    .exec()
                    .await
                    .map_err(|e| {
                        rspc::Error::with_cause(
                            rspc::ErrorCode::InternalServerError,
                            "Uh oh".into(),
                            e,
                        )
                    })?
                    .into_iter()
                    .map(Fact::from)
                    .collect_vec())
            })
        })
        .query("groups", |t| {
            t(|ctx: Ctx, entity_type: EntityType| async move {
                ctx.client
                    .fact_group()
                    .find_many(vec![prisma::fact_group::entity::equals(
                        entity_type.to_string(),
                    )])
                    .select(prisma::fact_group::select!({id name}))
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
        .query("slice", |t| {
            t(|ctx: Ctx, payload: FactSlicePayload| async move {
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
                        .find_many(vec![
                            prisma::fact::entity_facts::some(vec![
                                prisma::fact_on_entity::entity_id::equals(
                                    payload.entity_id.clone(),
                                ),
                            ]),
                            prisma::fact::slices::some(vec![prisma::fact_slice::id::equals(
                                slice.id,
                            )]),
                        ])
                        .select(FactWithValues::select(payload.entity_id))
                        .exec()
                        .await
                        .unwrap()
                        .into_iter()
                        .map(|fact| fact.into())
                        .collect_vec();

                    return Ok(FactSlice {
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
                        .fact_on_entity()
                        .upsert(
                            prisma::fact_on_entity::entity_id_fact_name(
                                payload.entity_id.clone(),
                                entry.name.clone(),
                            ),
                            prisma::fact_on_entity::create(
                                entry.value.clone().into(),
                                prisma::entity::id::equals(payload.entity_id.clone()),
                                prisma::fact::name::equals(entry.name),
                                vec![],
                            ),
                            vec![prisma::fact_on_entity::value::set(entry.value.into())],
                        )
                        .exec()
                        .await?;
                }

                let updated_facts: Vec<Fact> = ctx
                    .client
                    .fact()
                    .find_many(vec![])
                    .select(FactWithValues::select(payload.entity_id))
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
