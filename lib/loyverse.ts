interface LoyverseProduct {
  id: string
  handle: string
  item_name: string
  reference_id: string
  supplier_code: string
  price: number
  cost: number
  track_stock: boolean
  sold_by_weight: boolean
  is_composite: boolean
  use_production: boolean
  primary_supplier_id: string
  tax_ids: string[]
  modifiers_ids: string[]
  form: string
  color: string
  image_url: string
  option1_name: string
  option1_value: string
  option2_name: string
  option2_value: string
  option3_name: string
  option3_value: string
  variant_id: string
  stores: Array<{
    store_id: string
    pricing_type: string
    price: number
    available_for_sale: boolean
    optimal_stock: number
    low_stock: number
    stock_quantity: number
  }>
}

export class LoyverseAPI {
  private baseUrl = 'https://api.loyverse.com/v1.0'
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`Loyverse API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getProducts(limit = 250, cursor?: string): Promise<{
    products: LoyverseProduct[]
    cursor?: string
  }> {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (cursor) params.append('cursor', cursor)
    
    return this.request(`/products?${params}`)
  }

  async getProduct(productId: string): Promise<LoyverseProduct> {
    return this.request(`/products/${productId}`)
  }

  async updateProductStock(productId: string, storeId: string, quantity: number) {
    return this.request(`/products/${productId}/stores/${storeId}`, {
      method: 'PUT',
      body: JSON.stringify({
        stock_quantity: quantity
      })
    })
  }

  async getStores() {
    return this.request('/stores')
  }
}

export async function syncFromLoyverse(): Promise<{
  synced: number
  errors: string[]
}> {
  const token = process.env.LOYVERSE_API_TOKEN
  if (!token) {
    throw new Error('Loyverse API token not configured')
  }

  const loyverse = new LoyverseAPI(token)
  const errors: string[] = []
  let synced = 0
  let cursor: string | undefined

  try {
    do {
      const { products, cursor: nextCursor } = await loyverse.getProducts(250, cursor)
      cursor = nextCursor

      for (const loyverseProduct of products) {
        try {
          await syncProduct(loyverseProduct)
          synced++
        } catch (error) {
          errors.push(`Failed to sync ${loyverseProduct.item_name}: ${error}`)
        }
      }
    } while (cursor)

    return { synced, errors }
  } catch (error) {
    throw new Error(`Loyverse sync failed: ${error}`)
  }
}

async function syncProduct(loyverseProduct: LoyverseProduct) {
  const { prisma } = await import('./prisma')
  
  // Map Loyverse product to our schema
  const productData = {
    sku: loyverseProduct.reference_id || loyverseProduct.handle,
    title: loyverseProduct.item_name,
    price: loyverseProduct.price,
    images: loyverseProduct.image_url ? JSON.stringify([loyverseProduct.image_url]) : JSON.stringify([]),
    isActive: true
  }

  // Find or create product
  let product = await prisma.product.findUnique({
    where: { sku: productData.sku }
  })

  if (!product) {
    product = await prisma.product.create({
      data: productData
    })
  } else {
    product = await prisma.product.update({
      where: { id: product.id },
      data: {
        title: productData.title,
        price: productData.price,
        images: productData.images
      }
    })
  }

  // Sync variants (store-specific inventory)
  for (const store of loyverseProduct.stores) {
    const variantSku = `${productData.sku}-${store.store_id}`
    const attributes = JSON.stringify({
      store_id: store.store_id,
      pricing_type: store.pricing_type
    })

    let variant = await prisma.variant.findUnique({
      where: { sku: variantSku }
    })

    if (!variant) {
      variant = await prisma.variant.create({
        data: {
          productId: product.id,
          sku: variantSku,
          attributes,
          priceDelta: store.price - loyverseProduct.price,
          inventoryCount: store.stock_quantity || 0
        }
      })
    } else {
      // Update inventory and log changes
      const oldStock = variant.inventoryCount
      const newStock = store.stock_quantity || 0
      const change = newStock - oldStock

      if (change !== 0) {
        await prisma.variant.update({
          where: { id: variant.id },
          data: { inventoryCount: newStock }
        })

        await prisma.inventoryLog.create({
          data: {
            variantId: variant.id,
            change,
            reason: 'Loyverse sync',
            source: 'LOYVERSE_API'
          }
        })
      }
    }
  }
}