# Proxy SSL Configuration Guide

## Overview
This document details how the Nyx Crawler Bot handles SSL certificates for different types of proxy connections through ITBrowser.

## HTTP/HTTPS Proxy Configuration

### Standard HTTP Proxy
```javascript
const proxyConfig = {
  mode: "fixed_servers",
  server: "proxy.example.com",
  port: 8080,
  scheme: "http",
  username: "user",
  password: "pass"
};
```

SSL Handling:
- SSL traffic is tunneled through CONNECT method
- Certificate validation is handled by ITBrowser
- All certificate errors are automatically ignored

### HTTPS Proxy
```javascript
const proxyConfig = {
  mode: "fixed_servers",
  server: "proxy.example.com",
  port: 8443,
  scheme: "https",
  username: "user",
  password: "pass"
};
```

SSL Handling:
- TLS encryption between client and proxy
- Certificate validation for proxy connection (automatically handled)
- Website SSL certificates handled separately by ITBrowser

## SOCKS Proxy Configuration

### SOCKS4 Proxy
```javascript
const proxyConfig = {
  mode: "fixed_servers",
  server: "socks4.example.com",
  port: 1080,
  scheme: "socks4",
  username: "user",
  password: "pass"  // Only for SOCKS5
};
```

SSL Handling:
- SSL traffic tunneled through SOCKS4a extension
- No authentication support in SOCKS4
- Certificate errors automatically ignored

### SOCKS5 Proxy
```javascript
const proxyConfig = {
  mode: "fixed_servers",
  server: "socks5.example.com",
  port: 1080,
  scheme: "socks5",
  username: "user",
  password: "pass"
};
```

SSL Handling:
- Full SSL tunneling support
- Authentication through SOCKS5 protocol
- Username/password authentication supported
- Certificate errors automatically ignored

## Advanced SSL Configuration

### Custom SSL Settings for ITBrowser
The system automatically adds these command-line arguments for optimal SSL handling:

```javascript
const launchArgs = [
  '--ignore-certificate-errors',
  '--ignore-ssl-errors',
  '--allow-running-insecure-content',
  '--disable-web-security',
  '--no-sandbox',
  '--itbrowser-ignore-certificate-errors',
  '--itbrowser-disable-security-policy'
];
```

### Proxy Authentication Methods
1. **URL-based Authentication** (not recommended for security):
   ```
   http://username:password@proxy.example.com:8080
   ```

2. **Separate Configuration Fields** (recommended):
   ```javascript
   proxy: {
     server: "proxy.example.com",
     port: 8080,
     scheme: "http",
     username: "username",
     password: "password"
   }
   ```

3. **Header-based Authentication** (for proxies supporting it):
   ```javascript
   proxy: {
     // ... other settings
     headers: {
       "Proxy-Authorization": "Basic " + btoa("username:password")
     }
   }
   ```

## Certificate Validation Settings

### ITBrowser-specific Certificate Handling
```javascript
const browserConfig = {
  itbrowser: {
    ignore_certificate_errors: true,
    disable_security_policy: true,
    allow_invalid_ssl_certificates: true,
    ignore_ssl_common_name_mismatch: true,
    ignore_ssl_date_invalid: true,
    ignore_ssl_signature_invalid: true
  }
};
```

### Chromium Command-line Arguments
These are automatically added for comprehensive SSL handling:
- `--ignore-certificate-errors` - Ignores SSL certificate errors
- `--ignore-ssl-errors` - Ignores SSL-specific errors
- `--allow-running-insecure-content` - Allows loading of insecure content
- `--disable-web-security` - Disables web security (CORS, etc.)
- `--no-sandbox` - Disables sandboxing for better proxy compatibility
- `--disable-blink-features=AutomationControlled` - Hides automation indicators

## Proxy-specific SSL Handling

### Residential Proxies
- Often have self-signed certificates
- May require more lenient SSL settings
- ITBrowser automatically handles these cases

### Datacenter Proxies
- Usually have valid certificates
- Standard SSL handling is sufficient
- Rarely require special configuration

### Mobile Proxies
- May have mobile-specific certificate chains
- ITBrowser's mobile browser profile helps with compatibility
- Automatic certificate chain validation

## Troubleshooting SSL Issues

### Common Error Messages and Solutions

1. **"ERR_PROXY_CONNECTION_FAILED"**
   - Verify proxy server is accessible
   - Check proxy credentials
   - Ensure proxy supports the required protocol

2. **"ERR_CERT_AUTHORITY_INVALID"**
   - Automatically handled by `--ignore-certificate-errors`
   - No user action required

3. **"ERR_CERT_DATE_INVALID"**
   - Automatically handled by ITBrowser settings
   - System clock should be accurate

4. **"ERR_SSL_PROTOCOL_ERROR"**
   - May indicate proxy protocol mismatch
   - Try different proxy scheme (http vs https)

### Debugging Proxy SSL Issues
```javascript
// Enable verbose logging for proxy debugging
const launchArgs = [
  // ... other arguments
  '--v=1',
  '--enable-logging',
  '--log-level=0'
];
```

## No Manual Certificate Management Required
- Users do not need to install CA certificates
- No system-level certificate store modifications needed
- All SSL handling is contained within ITBrowser
- Certificate errors are automatically suppressed for proxy compatibility

## Security Considerations
While SSL certificate validation is relaxed for proxy compatibility:
- Traffic is contained within the application
- No sensitive user data is exposed
- The application is designed for automated browsing, not general web use
- All certificate handling is managed securely within ITBrowser's sandbox