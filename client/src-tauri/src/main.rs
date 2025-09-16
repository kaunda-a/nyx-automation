// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use std::env;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn start_server() -> Result<String, String> {
    // Get the current executable directory
    let current_dir = env::current_dir().map_err(|e| e.to_string())?;
    
    // Navigate to the server directory
    let server_dir = current_dir.parent().ok_or("Could not find parent directory")?.join("server");
    
    // Check if server directory exists
    if !server_dir.exists() {
        return Err("Server directory not found".to_string());
    }
    
    // Start the server process
    let output = Command::new("pnpm")
        .arg("start")
        .current_dir(&server_dir)
        .output()
        .map_err(|e| format!("Failed to start server: {}", e))?;
    
    if output.status.success() {
        Ok("Server started successfully".to_string())
    } else {
        let error = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to start server: {}", error))
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, start_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}