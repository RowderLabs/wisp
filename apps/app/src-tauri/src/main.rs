// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use snafu::ResultExt;
use std::sync::Arc;
use wispcore::prisma::PrismaClient;
use wispcore::api;

#[tokio::main]
async fn main() -> Result<(), snafu::Whatever> {
    let router = api::new().build().arced();
    let prisma: Arc<PrismaClient> = wispcore::prisma::PrismaClient::_builder()
        .with_url("file:../dev.db".into())
        .build()
        .await
        .whatever_context("Failed to initialize prisma client")?
        .into();

    //wispcore::seed::seed(&prisma).await;

    tauri::Builder::default()
        .plugin(rspc::integrations::tauri::plugin(router, move || {
            api::Ctx {
                client: prisma.clone(),
            }
        }))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
