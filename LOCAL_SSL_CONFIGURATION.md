# Local Development SSL Configuration Guide

## Understanding SSL Issues in Local Development

When running the Nyx Crawler Bot in a local development environment with Tauri, you may encounter "connection to this site is private" errors. These issues can stem from several factors:

### 1. Certificate Validation in Local Environments
- Tauri applications run in a webview that has strict security policies
- Localhost connections may trigger SSL warnings
- Self-signed certificates are not trusted by default

### 2. Mixed Content Issues
- Loading resources over both HTTP and HTTPS can trigger security warnings
- API endpoints and web resources may use different protocols

### 3. Proxy SSL Interference
- When using proxies, SSL certificate validation can become more complex
- Proxy servers may interfere with certificate validation

## Solutions Implemented

### Environment Configuration
We've added the following to the environment files to disable SSL certificate validation in development:

```
NODE_TLS_REJECT_UNAUTHORIZED=0
```

This setting tells Node.js to skip SSL certificate validation, which is acceptable for local development but should never be used in production.

### Tauri Configuration
Updated the Tauri configuration with a more permissive Content Security Policy (CSP):

```json
"csp": "default-src 'self' http://localhost:* https://*; img-src 'self' data: https://*; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
```

### Browser Launch Arguments
Enhanced the browser launch arguments with additional SSL handling flags:

- `--ignore-certificate-errors`
- `--ignore-ssl-errors`
- `--allow-running-insecure-content`
- `--disable-web-security`
- And several ITBrowser-specific SSL handling arguments

## Best Practices for Local Development

### 1. Use Consistent Protocols
- Ensure all resources (APIs, images, scripts) use the same protocol (HTTP in development)
- Avoid mixing HTTP and HTTPS resources

### 2. Environment-Specific Configurations
- Keep development and production configurations separate
- Never disable SSL validation in production environments

### 3. Proxy Configuration
- When using proxies, ensure they support the protocols you're using
- Configure proxy-specific SSL settings in the browser launch configuration

## Testing SSL Configuration

To verify that the SSL configuration is working correctly:

1. Start the development server:
   ```
   cd server
   npm start
   ```

2. Start the Tauri application:
   ```
   cd client
   npm run tauri dev
   ```

3. Launch a browser profile and navigate to websites that previously showed SSL errors

4. Verify that the "connection to this site is private" error no longer appears

## Production Considerations

When deploying to production:

1. Re-enable SSL certificate validation:
   ```
   NODE_TLS_REJECT_UNAUTHORIZED=1
   ```

2. Use proper SSL certificates for all connections

3. Implement a more restrictive Content Security Policy

4. Remove any `--ignore-certificate-errors` flags from browser launch arguments

These changes should resolve the SSL certificate issues you've been experiencing in local development while maintaining security best practices.