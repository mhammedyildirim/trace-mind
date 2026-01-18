# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving security updates depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public issue. Instead, please report it via one of the following methods:

### Preferred Method

1. **Email**: Send details to [your-email@example.com] (replace with your actual email)
2. **GitHub Security Advisory**: Use GitHub's private vulnerability reporting feature if available

### What to Include

Please include the following information in your report:

- **Type of vulnerability** (e.g., XSS, SQL injection, authentication bypass)
- **Affected component** (e.g., API endpoint, Docker image, configuration)
- **Steps to reproduce** the vulnerability
- **Potential impact** and severity assessment
- **Suggested fix** (if you have one)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity (typically 7-30 days)

## Security Best Practices

### For Users

1. **API Keys**: Never commit API keys to version control
   - Use environment variables or secrets management
   - Rotate keys regularly
   - Use least-privilege IAM roles

2. **Docker Images**: Always use official images from Docker Hub
   - Verify image signatures
   - Keep images updated
   - Scan images for vulnerabilities

3. **Network Security**: 
   - Use HTTPS in production
   - Restrict network access to TraceMind service
   - Use firewall rules appropriately

4. **Environment Variables**:
   - Never expose `.env` files
   - Use Docker secrets or Kubernetes secrets
   - Validate environment variables at runtime

### For Contributors

1. **Dependencies**: Keep dependencies updated
   - Run `npm audit` regularly
   - Update dependencies with security patches
   - Review dependency changes in PRs

2. **Code Review**: Security-focused code review
   - Check for injection vulnerabilities
   - Validate all user inputs
   - Review authentication/authorization logic

3. **Secrets**: Never commit secrets
   - Use `.gitignore` for sensitive files
   - Use environment variables for configuration
   - Review `.dockerignore` before building images

## Known Security Considerations

### Current Limitations

- **No Authentication**: TraceMind currently does not implement authentication. Use network-level security (firewalls, VPNs) to protect the service.
- **API Key Storage**: API keys are passed via environment variables. Ensure proper secrets management in production.
- **Input Validation**: All inputs are validated, but complex OTLP payloads should be validated at the source.

### Future Security Enhancements

- [ ] Add authentication/authorization support
- [ ] Add rate limiting
- [ ] Add request signing/verification
- [ ] Add audit logging
- [ ] Add TLS/SSL support documentation

## Security Updates

Security updates will be announced via:
- GitHub Security Advisories
- Release notes in CHANGELOG.md
- Version tags on Docker Hub

## Credits

We thank security researchers who responsibly disclose vulnerabilities.
