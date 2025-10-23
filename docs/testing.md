# Testing Guide

## Test Setup

```bash
# Install test dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev playwright @playwright/test

# Run tests
npm test              # Unit tests
npm run test:e2e      # E2E tests
npm run test:watch    # Watch mode
```

## Unit Tests

### API Testing
```javascript
// __tests__/api/products.test.js
import { GET } from '@/app/api/products/route'

describe('/api/products', () => {
  test('returns products list', async () => {
    const request = new Request('http://localhost:3000/api/products')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.products).toBeDefined()
    expect(data.pagination).toBeDefined()
  })
})
```

### Component Testing
```javascript
// __tests__/components/ProductCard.test.jsx
import { render, screen } from '@testing-library/react'
import ProductCard from '@/components/ProductCard'

test('displays product information', () => {
  const product = {
    id: '1',
    title: 'Gold Ring',
    price: 5000,
    images: ['image.jpg']
  }
  
  render(<ProductCard product={product} />)
  expect(screen.getByText('Gold Ring')).toBeInTheDocument()
  expect(screen.getByText('KES 5,000')).toBeInTheDocument()
})
```

## E2E Tests

### Checkout Flow
```javascript
// tests/e2e/checkout.spec.js
import { test, expect } from '@playwright/test'

test('complete checkout with M-Pesa', async ({ page }) => {
  await page.goto('/products')
  await page.click('[data-testid="product-card"]:first-child')
  await page.click('[data-testid="add-to-cart"]')
  await page.click('[data-testid="checkout"]')
  
  await page.fill('[data-testid="phone"]', '254712345678')
  await page.click('[data-testid="pay-mpesa"]')
  
  await expect(page.locator('[data-testid="payment-initiated"]')).toBeVisible()
})
```

### Search Functionality
```javascript
test('search products', async ({ page }) => {
  await page.goto('/products')
  await page.fill('[data-testid="search-input"]', 'ring')
  await page.press('[data-testid="search-input"]', 'Enter')
  
  await expect(page.locator('[data-testid="product-card"]')).toHaveCount(3)
})
```

## Load Testing

### K6 Scripts
```javascript
// tests/load/checkout.js
import http from 'k6/http'
import { check } from 'k6'

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 }
  ]
}

export default function() {
  let response = http.get('https://kitocraft.vercel.app/api/products')
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500
  })
}
```

## Payment Testing

### M-Pesa Sandbox
```bash
# Test credentials
DARAJA_CONSUMER_KEY="sandbox_key"
DARAJA_CONSUMER_SECRET="sandbox_secret"

# Test phone numbers
254708374149  # Success
254708374150  # Failure
```

### Test Cases
- Valid phone number formats
- Invalid phone numbers
- Payment timeouts
- Callback handling
- Payment reconciliation

## Database Testing

### Test Database Setup
```javascript
// jest.setup.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL
    }
  }
})

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "products" CASCADE`
})
```

## CI/CD Testing

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npx playwright test
```

## Performance Testing

### Lighthouse CI
```bash
# Install
npm install -g @lhci/cli

# Run
lhci autorun --upload.target=temporary-public-storage
```

### Core Web Vitals
- LCP < 2.5s
- FID < 100ms  
- CLS < 0.1

## Security Testing

### OWASP ZAP
```bash
# API security scan
docker run -t owasp/zap2docker-stable zap-api-scan.py \
  -t https://kitocraft.vercel.app/api/openapi.json
```

### Dependency Scanning
```bash
npm audit
npm audit fix
```