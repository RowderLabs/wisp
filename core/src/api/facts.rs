use rspc::RouterBuilder;
use serde::Deserialize;

use crate::{
    prisma,
    seed::{AttrFact, Fact, FactGroup, TextFact},
};

use super::Ctx;

prisma::fact_group::select!(raw_fact_group {name entity facts});

#[derive(Debug, Deserialize)]
struct FactFilters {
    group: Option<String>,
}
pub fn facts_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new().query("list", |t| {
        t(|ctx: Ctx, _: ()| async move {
            //takes no arguments
            let groups = ctx
                .client
                .fact_group()
                .find_many(vec![])
                .select(raw_fact_group::select())
                .exec()
                .await?;

            Ok(groups
                .into_iter()
                .map(|group| Into::<FactGroup>::into(group))
                .collect::<Vec<FactGroup>>())
        })
    })
}

impl Into<Fact> for prisma::fact::Data {
    fn into(self) -> Fact {
        match self.r#type.as_str() {
            "text" => Fact::TextItem(TextFact {
                item_type: self.r#type,
                key: self.key,
            }),
            "attr" => Fact::AttrItem(AttrFact {
                key: self.key,
                item_type: self.r#type,
                options: self.options.unwrap_or(String::new()),
            }),
            _ => panic!("unknown fact type"),
        }
    }
}

impl Into<FactGroup> for raw_fact_group::Data {
    fn into(self) -> FactGroup {
        let mapped_facts: Vec<Fact> = self.facts.into_iter().map(|fact| fact.into()).collect();

        FactGroup {
            name: self.name,
            entity: self.entity,
            facts: mapped_facts,
        }
    }
}
