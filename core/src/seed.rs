use crate::{api::characters::construct_path, prisma};

pub async fn seed(prisma: &prisma::PrismaClient) {
    //reset db

    let characters = prisma
        .character()
        .create(
            construct_path("Characters", &None),
            "Characters".into(),
            true,
            vec![],
        )
        .exec()
        .await
        .unwrap();

    let sotiria = prisma
        .character()
        .create(
            construct_path("Sotiria", &Some(characters.path.as_str())),
            "Sotiria".into(),
            false,
            vec![],
        )
        .exec()
        .await
        .unwrap();

    let sage = prisma
        .character()
        .create(
            construct_path("Sage", &Some(&characters.path)),
            "Sage".into(),
            false,
            vec![],
        )
        .exec()
        .await
        .unwrap();
}
