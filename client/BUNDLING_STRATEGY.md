# Client-Server Bundling Strategy

## Overview
This document explains how the client (frontend) and server (backend) components of the Nyx Crawler Bot are bundled together in the Tauri desktop application.

## Architecture

The Tauri application follows this architecture:

```
Tauri Desktop App
├── Frontend (React/Vite)
├── Backend (Node.js/Express)
└── Tauri Bridge (Rust)
```

## Bundling Process

1. **Frontend Build**: The React application is built using Vite and bundled into static files
2. **Backend Packaging**: The Node.js server is packaged with the application
3. **Tauri Integration**: Tauri wraps both components into a single executable

## Runtime Behavior

When the application starts:
1. Tauri launches the Node.js server as a child process
2. The React frontend is served from the embedded server
3. The Tauri window loads the frontend application
4. Communication between frontend and backend happens through HTTP/WS as usual

## Configuration

The bundling is configured in:
- `tauri.conf.json`: Specifies how to package the application
- `Cargo.toml`: Defines Rust dependencies
- GitHub Actions workflow: Automates the build process for all platforms

## Advantages

- Single executable with no external dependencies
- Easy distribution and installation
- Same development experience as web application
- Platform independence