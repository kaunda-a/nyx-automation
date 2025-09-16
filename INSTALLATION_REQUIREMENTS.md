# Installation Requirements

## Required System Packages

### 7-Zip
7-Zip is required for extracting the browser zip file. Install it using one of these methods:

**Windows:**
```bash
choco install 7zip
# or download from https://www.7-zip.org/
```

**macOS:**
```bash
brew install p7zip
```

**Ubuntu/Debian:**
```bash
sudo apt-get install p7zip-full
```

## Node.js Dependencies

### Client Dependencies (already in package.json)
```bash
cd client
pnpm install
```

### Server Dependencies (already in package.json)
```bash
cd server
pnpm install
```

### Tauri Development Dependencies
For Tauri development, you need Rust installed:

**Install Rust:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Install Tauri CLI:**
```bash
cargo install tauri-cli
```

## Development Workflow

1. Install system dependencies (7-Zip, Rust)
2. Install Node.js dependencies in both client and server directories
3. For development: `pnpm dev` in client, `pnpm dev` in server
4. For desktop development: `pnpm tauri dev` in client
5. For building: `pnpm tauri build` in client

## Notes
- The `fingerprint_browser_v1.0.7z` file should already be in the root directory
- No additional npm packages need to be installed beyond what's in package.json
- Rust and 7-Zip are the only system-level dependencies required