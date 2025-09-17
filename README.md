# Nyx Crawler Bot

Advanced website visit automation with anti-detection technology.

## Features
- Sophisticated browser automation
- Anti-detection mechanisms
- Campaign management system
- Real-time monitoring and analytics
- Automatic SSL certificate handling
- Proxy support with authentication

## Technologies
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, SQLite
- **Automation**: Playwright with ITBrowser
- **Desktop**: Tauri (Rust)

## Prerequisites
Before installing dependencies, ensure you have:
- Node.js (LTS version)
- pnpm package manager
- 7-Zip for browser extraction
- Rust (for Tauri development)

**Install 7-Zip:**
- Windows: `choco install 7zip` or download from https://www.7-zip.org/
- macOS: `brew install p7zip`
- Ubuntu: `sudo apt-get install p7zip-full`

**Install Rust (for Tauri development):**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Installation

### Installing Dependencies
```bash
# Install client dependencies
cd client
pnpm install

# Install server dependencies
cd ../server
pnpm install
```

### SSL Certificate Handling
The application automatically handles SSL certificates through ITBrowser's built-in certificate management system. No manual SSL certificate installation is required.

- All SSL certificate errors are automatically handled
- Proxy SSL connections are managed automatically
- No external certificate stores need to be modified

### Installing the Application
1. Clone the repository
2. Run the installer
3. The application will automatically download and extract the browser during first run if it's not already present

**Note**: The application will NOT function without the fingerprint browser. The browser will be automatically downloaded from GitHub if not found locally.

## Project Structure
- `client/` - React frontend application
- `server/` - Node.js backend server
- `fingerprint_browser_v1.0.7z` - Browser archive (automatically downloaded from GitHub if not present)

## Development

### Web Development
```bash
# Start frontend
cd client
pnpm dev

# Start backend (in another terminal)
cd server
pnpm dev
```

### Desktop Development
```bash
# Start Tauri development mode
cd client
pnpm tauri dev
```

## Building

### Web Build
```bash
cd client
pnpm build
```

### Desktop Build
```bash
cd client
pnpm tauri build
```

## Deployment

### Web Deployment
The web version can be deployed to any static hosting service.

### Desktop Deployment
The desktop version is packaged as a single executable for Windows, macOS, and Linux using Tauri.

## CI/CD
GitHub Actions are configured to automatically:
1. Download and extract the fingerprint browser from GitHub
2. Build and release the desktop application when new tags are pushed

## License
Proprietary software. All rights reserved.