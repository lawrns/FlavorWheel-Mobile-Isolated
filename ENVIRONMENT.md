# Environment Variables

This document describes all environment variables used in the Flavatix application.

## Required Variables

### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Application Configuration
```bash
NEXT_PUBLIC_APP_NAME=Flavatix
NEXT_PUBLIC_APP_DESCRIPTION=Mobile-first tasting experience for discovering authentic flavors
```

### Custom Configuration
```bash
CUSTOM_KEY=your-custom-key
```

## Optional Variables

### Redis Cache (for production performance)
```bash
REDIS_URL=redis://localhost:6379
```

### Analytics
```bash
ANALYTICS_ID=your-analytics-id
```

### Email Service
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Development
```bash
NODE_ENV=development
```

### Bundle Analysis
```bash
ANALYZE=false
```

### Test Database
```bash
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/test_db
```

### Monitoring
```bash
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### File Storage
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Payment Processing (if implementing premium features)
```bash
STRIPE_PUBLIC_KEY=pk_test_your-stripe-public-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
```

## Setup Instructions

1. Copy the required variables to your `.env.local` file
2. Replace placeholder values with your actual credentials
3. For local development, ensure Supabase is running
4. For production deployment, set these variables in your hosting platform

## Security Notes

- Never commit `.env` files to version control
- Use different values for development and production
- Rotate API keys regularly
- Use environment-specific service role keys
