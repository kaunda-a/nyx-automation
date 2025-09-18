use std::process::{Command, Stdio};
use std::path::PathBuf;
use tauri::Manager;
use log;

#[tauri::command]
async fn check_server_health() -> Result<bool, String> {
    let client = reqwest::Client::new();
    match client.get("http://localhost:3000/health")
        .timeout(std::time::Duration::from_secs(5))
        .send()
        .await
    {
        Ok(response) => Ok(response.status().is_success()),
        Err(_) => Ok(false),
    }
}

#[tauri::command]
async fn start_server() -> Result<String, String> {
    log::info!("Starting Nyx server...");
    
    // Try to find the server executable or script
    let server_paths = vec![
        "./server/start.js",
        "../server/start.js",
        "./server/dist/nyx-server.exe",
        "../server/dist/nyx-server.exe",
        "nyx-server.exe"
    ];

    for path in server_paths {
        let path_buf = PathBuf::from(path);
        if path_buf.exists() {
            log::info!("Found server at: {}", path);
            
            let result = if path.ends_with(".js") {
                // Run Node.js script
                log::info!("Starting server as Node.js process...");
                Command::new("node")
                    .arg(path)
                    .current_dir("./server")
                    .stdout(Stdio::null())
                    .stderr(Stdio::null())
                    .spawn()
            } else {
                // Run executable
                log::info!("Starting server as executable...");
                Command::new(path)
                    .stdout(Stdio::null())
                    .stderr(Stdio::null())
                    .spawn()
            };

            match result {
                Ok(_) => return Ok(format!("Server started from {}", path)),
                Err(e) => log::warn!("Failed to start server from {}: {}", path, e),
            }
        }
    }

    Err("Could not find or start server executable".to_string())
}

#[tauri::command]
async fn open_server_folder() -> Result<(), String> {
    // Open server folder using shell
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg("./server")
            .output()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg("./server")
            .output()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg("./server")
            .output()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
async fn start_embedded_server(app_handle: tauri::AppHandle) -> Result<(), String> {
    log::info!("Starting embedded server...");
    
    // Get the resource path for the server executable
    let resource_path = app_handle
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?
        .join("nyx-server.exe");

    if !resource_path.exists() {
        log::warn!("Server executable not found in resources, trying alternative methods...");
        return start_server().await;
    }

    // Start the server process with better error handling
    match Command::new(&resource_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
    {
        Ok(mut child) => {
            log::info!("Server process started, waiting for startup...");
            
            // Give the server time to start
            tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;
            
            // Check if the process is still running
            match child.try_wait() {
                Ok(Some(status)) => {
                    log::error!("Server process exited early with status: {}", status);
                    Err(format!("Server process exited early with status: {}", status))
                }
                Ok(None) => {
                    log::info!("Server started successfully and is running");
                    Ok(())
                }
                Err(e) => {
                    log::error!("Error checking server process: {}", e);
                    Err(format!("Error checking server process: {}", e))
                }
            }
        }
        Err(e) => {
            log::error!("Failed to start server: {}", e);
            Err(format!("Failed to start server: {}", e))
        }
    }
}

#[tauri::command]
async fn wait_for_server_ready() -> Result<bool, String> {
    log::info!("Waiting for server to be ready...");
    
    // Try to connect to server for up to 30 seconds
    for i in 0..30 {
        match check_server_health().await {
            Ok(true) => {
                log::info!("Server is ready!");
                return Ok(true);
            }
            Ok(false) => {
                log::debug!("Server not ready yet, attempt {}/30", i + 1);
                tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
            }
            Err(e) => {
                log::debug!("Server health check error: {}", e);
                tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
            }
        }
    }
    
    Err("Server failed to start within 30 seconds".to_string())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            greet,
            check_server_health,
            start_server,
            open_server_folder,
            start_embedded_server,
            wait_for_server_ready
        ])
        .setup(|app| {
            // Auto-check server health on startup
            let app_handle = app.handle().clone();
            tokio::spawn(async move {
                // Wait a moment for the app to fully initialize
                tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
                
                // Check if server is running
                match check_server_health().await {
                    Ok(true) => log::info!("Server is already running"),
                    Ok(false) => {
                        log::info!("Server not running, starting embedded server...");
                        match start_embedded_server(app_handle.clone()).await {
                            Ok(_) => log::info!("Embedded server started successfully"),
                            Err(e) => {
                                log::warn!("Failed to start embedded server: {}", e);
                                // Fallback to external server start
                                match start_server().await {
                                    Ok(msg) => log::info!("Fallback server start: {}", msg),
                                    Err(e2) => log::error!("All server start methods failed: {}", e2),
                                }
                            }
                        }
                    },
                    Err(e) => log::error!("Error checking server health: {}", e),
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}