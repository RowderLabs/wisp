// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use snafu::ResultExt;
use tauri::utils::assets::EmbeddedAssets;
use tauri::Context;
use std::path::PathBuf;
use std::sync::Arc;
use wispcore::api;
use wispcore::prisma::PrismaClient;

#[tokio::main]
async fn main() -> Result<(), snafu::Whatever> {
    let router = api::new().build().arced();
    let context = tauri::generate_context!();
    let dev_dir = init_dev(&context)?;
    let prisma_arc = init_prisma_client(&dev_dir).await?;


    tauri::Builder::default()
        .plugin(rspc::integrations::tauri::plugin(router, move || {
            api::Ctx {
                client: prisma_arc.clone(),
            }
        }))
        .run(context)
        .expect("error while running tauri application");

    Ok(())
}

async fn init_prisma_client(dev_data_dir: &PathBuf) -> Result<Arc<PrismaClient>, snafu::Whatever> {
    #[cfg(target_os = "windows")]
    let db_url = format!("file:{}\\dev.db", dev_data_dir.display());

    #[cfg(target_os = "macos")]
    let db_url = format!("file:{}/dev.db", dev_data_dir.display());
    println!("{}", dev_data_dir.display());

    #[cfg(debug_assertions)]
    let prisma: PrismaClient = wispcore::prisma::PrismaClient::_builder()
        .with_url(db_url)
        .build()
        .await
        .whatever_context("Failed to initialize prisma client")?;


    #[cfg(debug_assertions)]
    prisma
        ._db_push()
        .accept_data_loss()
        .force_reset()
        .await
        .whatever_context("Failed to push schema")?;

    //wispcore::seed::seed(&prisma).await;

    Ok(prisma.into())
}

fn init_dev_dir(path: &PathBuf) -> Result<(), snafu::Whatever> {
    std::fs::create_dir_all(path).whatever_context("failed to create dev dir")?;
    std::fs::create_dir(path.join("assets")).whatever_context("Failed to create dev dir.")?;
    Ok(())
}

fn init_dev(app_ctx: &Context<EmbeddedAssets>) -> Result<PathBuf, snafu::Whatever> {
    let config = app_ctx.config();
    let app_data_dir = tauri::api::path::app_data_dir(&config).unwrap();
    let dev_dir = app_data_dir.join("wisp_dev");
    if !dev_dir.as_path().exists() {
        init_dev_dir(&dev_dir)?;
    }

    Ok(dev_dir)
}
