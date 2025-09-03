# FlavorWheel México - Security Hardening Guide

## Database Security

### PostgreSQL Security Configuration

```sql
-- Enable SSL connections only
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';

-- Restrict connections
ALTER SYSTEM SET listen_addresses = 'localhost,10.0.0.0/8';
ALTER SYSTEM SET max_connections = 100;

-- Enable logging
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Password security
ALTER SYSTEM SET password_encryption = 'scram-sha-256';
```

### Row Level Security (RLS) Policies

All tables have RLS enabled with appropriate policies:

- Users can only access their own data
- Public data is accessible to authenticated users
- Admin roles have elevated permissions
- Audit trails for sensitive operations

### Database User Roles

```sql
-- Application user (limited permissions)
CREATE ROLE flavorwheel_app WITH LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE flavorwheel TO flavorwheel_app;
GRANT USAGE ON SCHEMA public TO flavorwheel_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO flavorwheel_app;

-- Read-only user for analytics
CREATE ROLE flavorwheel_readonly WITH LOGIN PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE flavorwheel TO flavorwheel_readonly;
GRANT USAGE ON SCHEMA public TO flavorwheel_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO flavorwheel_readonly;

-- Backup user
CREATE ROLE flavorwheel_backup WITH LOGIN PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE flavorwheel TO flavorwheel_backup;
GRANT USAGE ON SCHEMA public TO flavorwheel_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO flavorwheel_backup;
```

## Application Security

### Environment Variables Security

- Use strong, unique passwords for all services
- Rotate secrets regularly (every 90 days)
- Use environment-specific configurations
- Never commit secrets to version control
- Use secret management services in production

### API Security

#### Rate Limiting
```javascript
// Implement rate limiting per endpoint
const rateLimits = {
  '/api/auth/login': { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
  '/api/tastings': { windowMs: 60 * 1000, max: 100 }, // 100 requests per minute
  '/api/flavor-wheels': { windowMs: 60 * 1000, max: 10 }, // 10 generations per minute
  '/api/upload': { windowMs: 60 * 1000, max: 20 }, // 20 uploads per minute
}
```

#### Input Validation
- Validate all input data using Zod schemas
- Sanitize user-generated content
- Implement CSRF protection
- Use parameterized queries to prevent SQL injection

#### Authentication & Authorization
- Use JWT tokens with short expiration times
- Implement refresh token rotation
- Multi-factor authentication for admin accounts
- Session management with secure cookies

### File Upload Security

```javascript
// File upload restrictions
const uploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  virusScan: true,
  imageOptimization: true
}
```

### Content Security Policy (CSP)

```javascript
const cspConfig = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://api.supabase.co'],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
}
```

## Infrastructure Security

### SSL/TLS Configuration

```nginx
# Nginx SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;

# Security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### Firewall Configuration

```bash
# UFW firewall rules
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow from 10.0.0.0/8 to any port 5432  # Database access from private network only
ufw enable
```

### Docker Security

```dockerfile
# Use non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Security scanning
RUN npm audit --audit-level high
RUN npm audit fix

# Minimal base image
FROM node:18-alpine AS base
```

## Monitoring & Incident Response

### Security Monitoring

- Failed authentication attempts
- Unusual API usage patterns
- File upload anomalies
- Database access patterns
- SSL certificate expiration
- Dependency vulnerabilities

### Incident Response Plan

1. **Detection**: Automated alerts and monitoring
2. **Assessment**: Determine severity and impact
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threats and vulnerabilities
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Post-incident review

### Security Audit Checklist

#### Monthly
- [ ] Review access logs
- [ ] Check for failed login attempts
- [ ] Verify SSL certificate status
- [ ] Update dependencies
- [ ] Review user permissions

#### Quarterly
- [ ] Penetration testing
- [ ] Security code review
- [ ] Backup restoration testing
- [ ] Incident response drill
- [ ] Security training for team

#### Annually
- [ ] Full security audit
- [ ] Update security policies
- [ ] Review and update incident response plan
- [ ] Compliance assessment
- [ ] Third-party security assessment

## Compliance & Privacy

### GDPR Compliance

- Data minimization principles
- User consent management
- Right to be forgotten implementation
- Data portability features
- Privacy by design architecture

### Mexican Data Protection (LFPDPPP)

- Personal data inventory
- Privacy notice requirements
- User consent mechanisms
- Data transfer restrictions
- Breach notification procedures

### Security Best Practices

1. **Principle of Least Privilege**: Grant minimum necessary permissions
2. **Defense in Depth**: Multiple layers of security controls
3. **Zero Trust**: Verify everything, trust nothing
4. **Regular Updates**: Keep all systems and dependencies updated
5. **Backup Strategy**: Regular, tested backups with encryption
6. **Monitoring**: Comprehensive logging and alerting
7. **Training**: Regular security awareness training
8. **Documentation**: Maintain up-to-date security documentation

## Emergency Contacts

### Security Team
- Security Lead: security@flavorwheel.mx
- DevOps Lead: devops@flavorwheel.mx
- Legal Team: legal@flavorwheel.mx

### External Services
- Hosting Provider: [Provider Support]
- SSL Certificate Provider: [Certificate Authority]
- Security Consultant: [External Security Firm]

## Security Tools & Services

### Recommended Tools
- **Vulnerability Scanning**: Snyk, OWASP ZAP
- **SIEM**: Elastic Security, Splunk
- **WAF**: Cloudflare, AWS WAF
- **Secrets Management**: HashiCorp Vault, AWS Secrets Manager
- **Container Security**: Twistlock, Aqua Security

### Security Metrics

Track and monitor:
- Mean Time to Detection (MTTD)
- Mean Time to Response (MTTR)
- Number of security incidents
- Vulnerability remediation time
- Security training completion rates
- Compliance audit results
