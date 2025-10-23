# System Architecture

## Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cloudflare    │    │   Vercel Edge   │    │   Database      │
│   (CDN/WAF)     │◄──►│   (Next.js)     │◄──►│   (Neon PG)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cloudinary    │    │     Redis       │    │   Meilisearch   │
│   (Images)      │    │   (Cache)       │    │   (Search)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Daraja API    │    │   Loyverse      │    │   Sentry        │
│   (M-Pesa)      │    │   (POS)         │    │   (Monitoring)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Architecture

### Next.js App Router
```
app/
├── layout.tsx          # Root layout
├── page.tsx           # Homepage
├── products/
│   ├── page.tsx       # Product listing
│   └── [id]/
│       └── page.tsx   # Product detail
└── api/
    ├── products/      # Product APIs
    ├── checkout/      # Order APIs
    └── payments/      # Payment APIs
```

### Component Structure
```
components/
├── ui/               # Base components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Card.tsx
├── ProductCard.tsx   # Product display
├── SearchFilters.tsx # Filter sidebar
└── CheckoutForm.tsx  # Payment form
```

## Backend Architecture

### API Layer
- **Next.js API Routes**: Serverless functions on Vercel
- **Prisma ORM**: Type-safe database access
- **Zod Validation**: Request/response validation
- **JWT Auth**: Stateless authentication

### Database Design
```sql
-- Core entities
products (id, sku, title, price, images)
variants (id, product_id, attributes, inventory)
categories (id, name, slug, parent_id)
orders (id, user_id, status, total)
payments (id, order_id, gateway, status, amount)

-- Relationships
product_categories (product_id, category_id)
order_items (order_id, variant_id, quantity, price)
inventory_logs (variant_id, change, reason, source)
```

## Payment Architecture

### M-Pesa Integration
```
Client Request → API Route → Daraja STK Push → User Phone
     ↓              ↓              ↓              ↓
Order Created → Payment Record → Callback URL ← User Confirms
     ↓              ↓              ↓              ↓
Inventory Reserved → Status Update → Order Complete → Fulfillment
```

### Payment Flow
1. **Initiate**: Create order, reserve inventory
2. **Process**: Call Daraja STK Push API
3. **Callback**: Handle payment confirmation
4. **Complete**: Update order status, decrement stock

## Data Flow

### Product Catalog
```
POS System → Webhook → API → Database → Search Index
     ↓          ↓       ↓        ↓           ↓
Loyverse → Sync API → Prisma → PostgreSQL → Meilisearch
```

### Order Processing
```
Cart → Checkout → Payment → Fulfillment
  ↓       ↓         ↓          ↓
Redis → Database → M-Pesa → Email/SMS
```

## Caching Strategy

### Redis Layers
- **Session Cache**: User sessions (15min TTL)
- **Product Cache**: Hot products (5min TTL)
- **Search Cache**: Query results (10min TTL)
- **Rate Limiting**: API throttling

### CDN Caching
- **Static Assets**: Images, CSS, JS (1 year)
- **Product Pages**: ISR with 1 hour revalidation
- **API Responses**: No cache for dynamic data

## Security Architecture

### Authentication
```
Client → JWT Token → API Middleware → Route Handler
   ↓        ↓            ↓              ↓
Login → Redis Session → Verify Token → Access Control
```

### Data Protection
- **Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Secrets**: Environment variables, no hardcoded keys
- **Validation**: Zod schemas for all inputs
- **Rate Limiting**: Redis-based throttling

## Monitoring Architecture

### Error Tracking
```
Application Error → Sentry → Alert → Team Notification
       ↓             ↓        ↓           ↓
Stack Trace → Dashboard → Slack → Incident Response
```

### Performance Monitoring
- **Vercel Analytics**: Core Web Vitals, page performance
- **Database**: Query performance, connection pool
- **API**: Response times, error rates
- **Payments**: Success rates, callback latency

## Scalability Design

### Horizontal Scaling
- **Serverless Functions**: Auto-scale with traffic
- **Database**: Read replicas for high load
- **CDN**: Global edge caching
- **Search**: Meilisearch cluster scaling

### Performance Optimization
- **Image Optimization**: Next.js Image component + Cloudinary
- **Code Splitting**: Dynamic imports for large components
- **Database**: Optimized queries with proper indexing
- **Caching**: Multi-layer caching strategy

## Deployment Architecture

### CI/CD Pipeline
```
Git Push → GitHub Actions → Tests → Build → Deploy → Monitor
    ↓           ↓           ↓       ↓       ↓        ↓
Feature → Unit Tests → E2E Tests → Vercel → Health Check → Alerts
```

### Environment Strategy
- **Development**: Local with Docker services
- **Staging**: Vercel preview deployments
- **Production**: Vercel with custom domain

## Disaster Recovery

### Backup Strategy
- **Database**: Neon automatic daily backups
- **Code**: GitHub repository with history
- **Images**: Cloudinary with redundancy
- **Configuration**: Environment variables exported

### Recovery Procedures
1. **Database**: Point-in-time recovery from Neon
2. **Application**: Vercel rollback to previous deployment
3. **DNS**: Cloudflare failover to maintenance page
4. **Monitoring**: Automated health checks and alerts