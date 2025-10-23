# Development Guide

## Quick Start

```bash
# Clone and setup
git clone <repo-url>
cd kitocraft
npm install
cp .env.example .env.local

# Database setup
npx prisma migrate dev
npx prisma generate

# Start development
npm run dev
```

## Environment Variables

```bash
# Required for development
DATABASE_URL="postgresql://user:pass@localhost:5432/kitocraft"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="dev-secret-key"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# M-Pesa (use sandbox)
DARAJA_CONSUMER_KEY="sandbox_key"
DARAJA_CONSUMER_SECRET="sandbox_secret"
DARAJA_BUSINESS_SHORT_CODE="174379"
DARAJA_PASSKEY="sandbox_passkey"

# Optional for full features
CLOUDINARY_CLOUD_NAME="your_cloud"
MEILISEARCH_HOST="http://localhost:7700"
```

## Local Services

### Database (PostgreSQL)
```bash
# Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15

# Or use Neon/Supabase cloud DB
```

### Redis
```bash
# Docker
docker run --name redis -p 6379:6379 -d redis:7

# Or use Redis Cloud
```

### Meilisearch
```bash
# Docker
docker run -p 7700:7700 getmeili/meilisearch:latest
```

## Development Workflow

### 1. Database Changes
```bash
# Create migration
npx prisma migrate dev --name add_feature

# Reset database
npx prisma migrate reset
```

### 2. API Development
```bash
# Test API endpoints
curl http://localhost:3000/api/products
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"items":[{"variantId":"123","quantity":1}]}'
```

### 3. Testing
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Watch mode
npm test -- --watch
```

## Code Structure

```
app/
├── api/           # API routes
├── products/      # Product pages
├── layout.tsx     # Root layout
└── page.tsx       # Homepage

components/        # Reusable components
lib/              # Utilities (prisma, redis)
prisma/           # Database schema
docs/             # Documentation
```

## API Testing

### Products
```bash
# List products
GET /api/products?category=rings&priceMin=1000

# Get product
GET /api/products/clx123
```

### Payments (Sandbox)
```bash
# Initiate M-Pesa
POST /api/payments/daraja/initiate
{
  "orderId": "order_123",
  "phoneNumber": "254712345678",
  "amount": 1000
}
```

## Common Issues

### Database Connection
```bash
# Check connection
npx prisma db pull

# Fix connection pool
# Use Neon/Supabase for serverless
```

### M-Pesa Sandbox
```bash
# Test phone: 254708374149
# Use sandbox credentials only
# Check callback URL is accessible
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Performance Tips

- Use `next/image` for all images
- Implement ISR for product pages
- Cache API responses with Redis
- Use Prisma connection pooling
- Optimize database queries with `include`

## Debugging

```bash
# Enable debug logs
DEBUG=* npm run dev

# Database queries
# Add to prisma/schema.prisma
# log: ["query", "info", "warn", "error"]

# API debugging
console.log('API request:', request.body)
```