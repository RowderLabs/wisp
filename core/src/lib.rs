#![allow(unused)]
enum RelationshipType {
    Marriage(bool),
    Affair
}

//final output for graph shouldnt care about details only rendering stuff
struct FamilyTreeNode {
    id: String,
    hidden: bool
}

struct TreeData {
    nodes: Vec<FamilyTreeNode>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        //get list of people
        //

    }
}
