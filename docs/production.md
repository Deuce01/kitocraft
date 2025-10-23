# Production Deployment Guide

## Vercel Deployment

### 1. Connect Repository
```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel --prod
```

### 2. Environment Variables
Set in Vercel Dashboard:

```bash
# Database (use Neon/Supabase)
DATABASE_URL="postgresql://user:pass@db.region.neon.tech/kitocraft"

# Redis (use Upstash)
REDIS_URL="rediss://user:pass@region.upstash.io:6380"

# M-Pesa Production
DARAJA_CONSUMER_KEY="prod_consumer_key"
DARAJA_CONSUMER_SECRET="prod_consumer_secret"
DARAJA_BUSINESS_SHORT_CODE="your_shortcode"
DARAJA_PASSKEY="prod_passkey"

# Services
CLOUDINARY_CLOUD_NAME="prod_cloud"
MEILISEARCH_HOST="https://search.yourdomain.com"
SENTRY_DSN="https://sentry.io/dsn"

# Security
JWT_SECRET="secure-random-256-bit-key"
NEXT_PUBLIC_BASE_URL="https://kitocraft.vercel.app"
```

### 3. Domain Setup
```bash
# Add custom domain in Vercel
# Configure DNS: CNAME -> cname.vercel-dns.com
# SSL automatically provisioned
```

## Database Setup (Neon)

```bash
# Create production database
# 1. Sign up at neon.tech
# 2. Create project "kitocraft-prod"
# 3. Copy connection string
# 4. Run migrations

npx prisma migrate deploy
```

## Monitoring Setup

### Sentry (Error Tracking)
```bash
# 1. Create Sentry project
# 2. Add DSN to environment
# 3. Errors auto-tracked in production
```

### Uptime Monitoring
```bash
# Monitor these endpoints:
# - https://kitocraft.vercel.app/api/health
# - https://kitocraft.vercel.app/api/products
# - Payment callback URLs
```

## Security Checklist

### Environment
- [ ] All secrets in environment variables
- [ ] No hardcoded credentials in code
- [ ] JWT secret is 256-bit random
- [ ] Database uses SSL connections

### API Security
- [ ] Rate limiting on payment endpoints
- [ ] Input validation with Zod
- [ ] CORS configured properly
- [ ] Webhook signature verification

### Payment Security
- [ ] M-Pesa callback signature validation
- [ ] Payment idempotency keys
- [ ] No PCI data stored locally
- [ ] Audit logs for all transactions

## Performance Optimization

### CDN Configuration
```bash
# Cloudflare setup:
# 1. Add domain to Cloudflare
# 2. Configure caching rules
# 3. Enable image optimization
# 4. Set up page rules for API routes
```

### Database Optimization
```bash
# Connection pooling (if using RDS)
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"

# Query optimization
# - Add database indexes
# - Use Prisma query optimization
# - Implement Redis caching
```

## Backup Strategy

### Database Backups
```bash
# Neon: Automatic daily backups
# Manual backup:
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Code Backups
```bash
# GitHub repository
# Vercel deployment history
# Environment variables exported
```

## Deployment Pipeline

### GitHub Actions
```yaml
# Automatic on main branch push
# 1. Run tests
# 2. Build application
# 3. Deploy to Vercel
# 4. Run database migrations
# 5. Notify team
```

### Rollback Procedure
```bash
# Vercel rollback
vercel --prod --rollback

# Database rollback
npx prisma migrate reset --force
npx prisma migrate deploy
```

## Health Checks

### API Health Endpoint
```bash
GET /api/health
# Returns: {"status": "ok", "database": "connected", "redis": "connected"}
```

### Critical Monitors
- Payment success rate > 98%
- API response time < 300ms
- Database connection pool < 80%
- Error rate < 1%

## Incident Response

### Payment Issues
1. Check Daraja API status
2. Verify callback URL accessibility
3. Review payment logs in Sentry
4. Manual payment reconciliation if needed

### Database Issues
1. Check connection pool usage
2. Review slow query logs
3. Scale database if needed
4. Implement read replicas for high load

### Performance Issues
1. Check Vercel function logs
2. Review database query performance
3. Verify CDN cache hit rates
4. Scale Redis if needed

## Maintenance Windows

### Database Maintenance
- Schedule during low traffic (2-4 AM EAT)
- Notify users 24 hours in advance
- Have rollback plan ready

### Dependency Updates
```bash
# Monthly security updates
npm audit fix
npm update

# Test in staging first
# Deploy during maintenance window
```

## Scaling Considerations

### Traffic Growth
- Vercel auto-scales functions
- Database: upgrade Neon plan
- Redis: upgrade Upstash plan
- CDN: Cloudflare handles traffic spikes

### Feature Scaling
- Implement feature flags
- A/B testing with Vercel Edge Config
- Gradual rollouts for major features