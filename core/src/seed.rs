use crate::prisma::{self, character_collection, family, person, relationship};

pub async fn seed(prisma: &prisma::PrismaClient) {
    let family = prisma
        .family()
        .create("Blackwoods".into(), vec![])
        .exec()
        .await
        .unwrap();

    let lord = prisma
        .person()
        .create(
            "Lord".into(),
            vec![person::family::connect(family::id::equals(family.id))],
        )
        .exec()
        .await
        .unwrap();
    let lady = prisma
        .person()
        .create("Lady".into(), vec![])
        .exec()
        .await
        .unwrap();

    let marriage = prisma
        .relationship()
        .create(
            "marriage".into(),
            vec![relationship::members::connect(vec![
                person::id::equals(lord.id),
                person::id::equals(lady.id),
            ])],
        )
        .exec()
        .await
        .unwrap();

    let sage = prisma
        .person()
        .create(
            "Sage".into(),
            vec![
                person::child_of::connect(relationship::id::equals(marriage.id)),
                person::parents::connect(vec![
                    person::id::equals(lord.id),
                    person::id::equals(lady.id),
                ]),
            ],
        )
        .exec()
        .await
        .unwrap();

    let characters = prisma
        .character_collection()
        .create(
            "characters".into(),
            vec![character_collection::characters::connect(vec![
                person::id::equals(lord.id),
                person::id::equals(lady.id),
                person::id::equals(sage.id)
            ])],
        )
        .exec()
        .await
        .unwrap();
}
