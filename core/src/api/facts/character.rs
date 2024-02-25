use itertools::Itertools;
use prisma_client_rust::exec;
use rspc::RouterBuilder;
use serde::{Deserialize, Serialize};

use crate::entity::EntityType;
use crate::fact::{Fact, FactEntry, FactSlice, FactValue};
use crate::prisma::{self, fact, fact_group, fact_slice};

use super::Ctx;
use super::DbFact;

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
                group: String,
            }

            t(|ctx: Ctx, payload: FactListPayload| async move {
                Ok(ctx
                    .client
                    .fact()
                    .find_many(vec![fact::entity_facts::some(vec![prisma::fact_on_entity::entity_id::equals(payload.id)]), fact::group::is(vec![fact_group::name::equals(
                        payload.group,
                    )])])
                    .select(DbFact::select())
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
                    .map(|fact| Fact::from(fact))
                    .collect_vec())
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
                            fact::entity_facts::some(vec![prisma::fact_on_entity::entity_id::equals(payload.entity_id)]),
                            fact::slices::some(vec![
                            prisma::fact_slice::id::equals(slice.id),
                        ])])
                        .select(DbFact::select())
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
                    .select(DbFact::select())
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
