# FlavorWheel México - Deployment Guide

## Overview

This document provides comprehensive instructions for deploying FlavorWheel México to different environments.

## Prerequisites

### Required Tools
- Node.js 18+
- Docker & Docker Compose
- Supabase CLI
- Git
- AWS CLI (for production)

### Required Accounts
- Supabase account with projects for staging/production
- Vercel account for hosting
- GitHub account for CI/CD
- AWS account for backups (optional)

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/lawrns/FlavorWheel-Mobile-Isolated.git
cd FlavorWheel-Mobile-Isolated
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the environment template and configure:
```bash
cp .env.example .env.local
```

Fill in the required environment variables:
- Supabase URL and keys
- Database connection strings
- Authentication secrets
- Third-party API keys

## Local Development

### Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Access services:
# - App: http://localhost:3001
# - Database: localhost:5432
# - Supabase Studio: http://localhost:54323
# - Grafana: http://localhost:3002
# - Prometheus: http://localhost:9090
```

### Manual Setup
```bash
# Start Supabase locally
supabase start

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## Database Setup

### 1. Initialize Database
```bash
# Run comprehensive schema migration
psql $DATABASE_URL -f database/migrations/001_comprehensive_schema_update.sql

# Set up storage policies
psql $DATABASE_URL -f supabase/storage-policies.sql

# Create materialized views
psql $DATABASE_URL -f database/performance/materialized-views.sql
```

### 2. Seed Data (Optional)
```bash
npm run db:seed
```

## Staging Deployment

### Automatic Deployment
Push to `develop` branch triggers automatic staging deployment:
```bash
git checkout develop
git push origin develop
```

### Manual Deployment
```bash
# Deploy to staging
npm run deploy:staging

# Or use deployment script
./scripts/deploy.sh staging
```

### Staging Environment
- URL: https://staging.flavorwheel.mx
- Database: Supabase staging project
- Monitoring: Limited monitoring enabled

## Production Deployment

### Prerequisites
1. All tests must pass
2. Security scan must pass
3. Code review approval required
4. Database backup created

### Automatic Deployment
Push to `main` branch triggers production deployment:
```bash
git checkout main
git merge develop
git push origin main
```

### Manual Deployment
```bash
# Deploy to production
npm run deploy:prod

# Or use deployment script with safety checks
./scripts/deploy.sh production
```

### Production Environment
- URL: https://flavorwheel.mx
- Database: Supabase production project
- Monitoring: Full monitoring and alerting
- Backups: Automated daily backups

## Database Migrations

### Running Migrations
```bash
# Development
npm run db:migrate

# Staging
supabase db push --linked --project-ref STAGING_PROJECT_ID

# Production (with backup)
./scripts/backup-strategy.sh full
supabase db push --linked --project-ref PRODUCTION_PROJECT_ID
```

### Creating New Migrations
```bash
# Create new migration file
supabase migration new migration_name

# Edit the migration file
# Run locally first
supabase db reset
```

## Monitoring & Maintenance

### Health Checks
```bash
# Check application health
curl https://flavorwheel.mx/api/health

# Check database health
npm run db:health

# Run full system health check
./scripts/deploy.sh health
```

### Monitoring Dashboards
- **Grafana**: Application metrics and performance
- **Supabase Dashboard**: Database metrics and logs
- **Vercel Analytics**: Web performance and usage
- **Sentry**: Error tracking and performance monitoring

### Backup & Recovery
```bash
# Create full backup
./scripts/backup-strategy.sh full

# Create incremental backup
./scripts/backup-strategy.sh incremental

# Restore from backup
./scripts/backup-strategy.sh restore backup_file.sql.gz target_database
```

## Security Considerations

### SSL/TLS
- All environments use HTTPS
- SSL certificates auto-renewed
- HSTS headers enabled

### Database Security
- Row Level Security (RLS) enabled
- Encrypted connections only
- Regular security updates
- Access logging enabled

### Application Security
- Content Security Policy (CSP)
- Rate limiting implemented
- Input validation and sanitization
- Regular dependency updates

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
npm run clean
npm ci
npm run build
```

#### Database Connection Issues
```bash
# Check database status
supabase status

# Reset local database
supabase db reset
```

#### Migration Failures
```bash
# Check migration status
supabase migration list

# Repair migrations
supabase migration repair
```

### Rollback Procedures

#### Application Rollback
```bash
# Rollback to previous Vercel deployment
vercel rollback

# Or deploy specific commit
git checkout PREVIOUS_COMMIT_HASH
npm run deploy:prod
```

#### Database Rollback
```bash
# Restore from backup
./scripts/backup-strategy.sh restore latest_backup.sql.gz

# Or run reverse migration
psql $DATABASE_URL -f database/migrations/rollback_script.sql
```

## Performance Optimization

### Database Performance
- Materialized views refreshed hourly
- Query optimization enabled
- Connection pooling configured
- Regular VACUUM and ANALYZE

### Application Performance
- Static assets cached via CDN
- Image optimization enabled
- Code splitting implemented
- Performance monitoring active

## Support & Contacts

### Development Team
- **Lead Developer**: dev@flavorwheel.mx
- **DevOps Engineer**: devops@flavorwheel.mx
- **Database Administrator**: dba@flavorwheel.mx

### Emergency Contacts
- **On-call Engineer**: +52-XXX-XXX-XXXX
- **Emergency Email**: emergency@flavorwheel.mx

### External Support
- **Supabase Support**: Via dashboard
- **Vercel Support**: Via dashboard
- **AWS Support**: Via console

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Security scan passed
- [ ] Code review completed
- [ ] Database backup created
- [ ] Environment variables updated
- [ ] Dependencies updated

### During Deployment
- [ ] Monitor deployment logs
- [ ] Verify health checks
- [ ] Test critical functionality
- [ ] Monitor error rates
- [ ] Check performance metrics

### Post-deployment
- [ ] Verify all features working
- [ ] Monitor for 24 hours
- [ ] Update documentation
- [ ] Notify stakeholders
- [ ] Schedule post-deployment review

## Maintenance Schedule

### Daily
- Automated backups
- Health check monitoring
- Error rate monitoring

### Weekly
- Dependency updates
- Performance review
- Security scan

### Monthly
- Full system backup test
- Security audit
- Performance optimization review

### Quarterly
- Disaster recovery drill
- Security penetration test
- Infrastructure review
