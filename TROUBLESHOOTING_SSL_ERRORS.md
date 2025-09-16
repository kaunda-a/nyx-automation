# Troubleshooting SSL Certificate Errors

## Common "Your connection is not private" Errors and Solutions

### Error: "NET::ERR_CERT_COMMON_NAME_INVALID"
**Cause**: Certificate doesn't match the domain name
**Solution**: 
```javascript
// Add to browser launch arguments:
[
  '--ignore-ssl-common-name-mismatch',
  '--ignore-certificate-errors',
  '--ignore-ssl-errors'
]
```

### Error: "NET::ERR_CERT_DATE_INVALID"
**Cause**: Certificate is expired or not yet valid
**Solution**:
```javascript
// Add to browser configuration:
{
  "itbrowser": {
    "ignore_ssl_date_invalid": true,
    "ignore_certificate_errors": true
  },
  "commandsAdd": [
    "--ignore-certificate-errors",
    "--ignore-ssl-errors",
    "--test-type"
  ]
}
```

### Error: "NET::ERR_CERT_AUTHORITY_INVALID"
**Cause**: Self-signed or untrusted certificate authority
**Solution**:
```javascript
// Add to browser launch arguments:
[
  '--ignore-certificate-errors',
  '--allow-running-insecure-content',
  '--test-type',
  '--no-sandbox'
]
```

## Advanced Solutions

### 1. Certificate Pinning Issues
Some websites use certificate pinning that can conflict with proxies:

```javascript
// Add these flags to bypass certificate pinning:
[
  '--ignore-certificate-errors-spki-list',
  '--disable-features=CertificateTransparencyComponentUpdater',
  '--disable-features=ChromeCertsDeprecationTrial',
  '--test-type'
]
```

### 2. Proxy Authentication with SSL
For authenticated proxies that still show SSL errors:

```javascript
// In proxy configuration:
{
  "proxy": {
    "mode": "fixed_servers",
    "server": "proxy.example.com",
    "port": 8080,
    "scheme": "https",  // Use https for SSL proxy
    "username": "user",
    "password": "pass"
  },
  // Add these browser arguments:
  "commandsAdd": [
    "--proxy-server=https://proxy.example.com:8080",
    "--proxy-user=user",
    "--proxy-password=pass",
    "--ignore-certificate-errors",
    "--ignore-ssl-errors",
    "--test-type"
  ]
}
```

### 3. HSTS (HTTP Strict Transport Security) Issues
Sites with HSTS can force HTTPS and cause issues with proxies:

```javascript
// Clear HSTS cache and add flags:
[
  '--ignore-certificate-errors',
  '--ignore-ssl-errors', 
  '--disable-features=StrictTransportSecurity',
  '--test-type'
]
```

## Debugging Steps

### 1. Enable Verbose Logging
```bash
# Set environment variables:
export LOG_LEVEL=debug
export DEBUG=*

# Or on Windows:
set LOG_LEVEL=debug
set DEBUG=*
```

### 2. Check Browser Launch Arguments
Look in the console output for:
```
🚀 Launching ITCrawler Browser with arguments: [
  "--ignore-certificate-errors",
  "--ignore-ssl-errors", 
  "--allow-running-insecure-content",
  "--test-type"
]
```

### 3. Test with Known Bad SSL Sites
Use these test sites to verify SSL handling:
- https://expired.badssl.com/ (Expired certificate)
- https://wrong.host.badssl.com/ (Wrong hostname)
- https://self-signed.badssl.com/ (Self-signed certificate)
- https://untrusted-root.badssl.com/ (Untrusted root)

### 4. Manual Browser Test
```bash
# Launch ITBrowser manually with SSL flags:
./chrome.exe --ignore-certificate-errors --test-type --user-data-dir=./test-profile https://expired.badssl.com/
```

## ITBrowser-Specific Solutions

### 1. Update Browser Configuration
Ensure your `itBrowserAPI.js` includes:

```javascript
const browserConfig = {
  "commandsAdd": [
    "--ignore-certificate-errors",
    "--ignore-ssl-errors",
    "--allow-running-insecure-content",
    "--disable-web-security", 
    "--no-sandbox",
    "--test-type",
    "--ignore-certificate-errors-spki-list",
    "--ignore-ssl-common-name-mismatch"
  ],
  "itbrowser": {
    "ignore_certificate_errors": true,
    "allow_invalid_ssl_certificates": true,
    "ignore_ssl_common_name_mismatch": true,
    "ignore_ssl_date_invalid": true
  }
};
```

### 2. Proxy-Specific SSL Configuration
For different proxy types:

```javascript
// HTTP Proxy
"--proxy-server=http://proxy.example.com:8080"

// HTTPS Proxy  
"--proxy-server=https://proxy.example.com:8443"

// SOCKS5 Proxy
"--proxy-server=socks5://proxy.example.com:1080"
```

## No User Action Required
Remember that end users should not:
- See certificate warning dialogs
- Need to manually accept certificates
- Install CA certificates on their system
- Modify browser security settings

All SSL certificate handling is managed automatically by ITBrowser.

If SSL errors persist after implementing these solutions, please contact support with:
1. The exact error message
2. The website URL causing the issue
3. Your proxy configuration (without credentials)
4. Console logs with debug output enabled