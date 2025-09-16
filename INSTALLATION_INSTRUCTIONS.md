# Nyx Crawler Bot Installation

## Prerequisites
Before installing, ensure you have:
- 7-Zip installed (for extracting the browser)
- Node.js and pnpm (for development)

**Install 7-Zip:**
- Windows: `choco install 7zip` or download from https://www.7-zip.org/
- macOS: `brew install p7zip`
- Ubuntu: `sudo apt-get install p7zip-full`

## Installation Steps
1. Clone or download the repository (includes the browser zip file)
2. Run the installer
3. The application will automatically extract the browser during first run

## For Developers
```bash
# Install dependencies
cd client
pnpm install
cd ../server
pnpm install

# For Tauri development, also install Rust:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Important Notes
- The application includes the fingerprint browser zip file
- The browser is automatically extracted on first run
- The application will NOT function without the fingerprint browser
- No manual download required

## System Requirements
- Minimum 500MB free disk space for browser extraction