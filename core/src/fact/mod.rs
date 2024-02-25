use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "type")]
pub enum Fact {
    Text {
        name: String,
        value: String,
        group_name: String,
    },
    Attr {
        name: String,
        value: Vec<String>,
        options: Vec<String>,
        group_name: String,
    },
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(untagged)]
pub enum FactValue {
    Text(String),
    Attr(Vec<String>),
}

impl Into<String> for FactValue {
    fn into(self) -> String {
        match self {
            FactValue::Text(value) => value,
            FactValue::Attr(value) => serde_json::to_string(&value).unwrap(),
        }
    }
}


#[derive(Debug, Serialize, Deserialize, specta::Type)]
pub struct FactSlice {
    pub name: String,
    pub facts: Vec<Fact>
}

#[derive(Debug, Deserialize, specta::Type)]
pub struct FactEntry {
    pub value: FactValue,
    pub name: String,
}