# Nyx Crawler Bot - Tauri Desktop Application

This directory contains the configuration for building the Nyx Crawler Bot as a desktop application using Tauri.

## Project Structure

- `src-tauri/` - Tauri configuration and Rust code
  - `tauri.conf.json` - Tauri configuration file
  - `src/main.rs` - Main Rust entry point
  - `Cargo.toml` - Rust package manifest
  - `build.rs` - Build script
- `vite.config.tauri.ts` - Vite configuration optimized for Tauri

## Development

To run the application in development mode:

```bash
# In the client directory
pnpm tauri dev
```

## Building

To build the application for distribution:

```bash
# In the client directory
pnpm tauri build
```

This will generate platform-specific binaries in the `src-tauri/target/release/bundle/` directory.

## GitHub Actions

The repository includes a GitHub Actions workflow that automatically builds and releases the application for all platforms when a new tag is pushed.

To create a new release:

1. Create a new tag: `git tag v1.0.0`
2. Push the tag: `git push origin v1.0.0`
3. The GitHub Actions workflow will automatically build and create a draft release

## Configuration

The Tauri configuration is set up to:
- Bundle both the frontend and backend together
- Create a single executable with no external dependencies
- Support Windows, macOS, and Linux
- Use the existing Vite development server during development

## Customization

To customize the Tauri setup:
1. Modify `src-tauri/tauri.conf.json` for build and window settings
2. Update `src-tauri/Cargo.toml` to add Rust dependencies
3. Modify `src-tauri/src/main.rs` to add custom Rust code