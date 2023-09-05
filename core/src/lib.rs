#![allow(unused)]
use std::collections::HashSet;

use itertools::Itertools;
use prisma::{person, relationship};
pub mod prisma;
pub mod tree;
pub mod seed;

enum RelationshipType {
    Marriage(bool),
    Affair,
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        //get list of people
    }
}
