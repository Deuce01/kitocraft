import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  sku: string
  title: string
  price: number
  images: string[]
  variants: Array<{
    id: string
    inventoryCount: number
  }>
}

interface ProductGridProps {
  searchParams: {
    category?: string
    q?: string
    priceMin?: string
    priceMax?: string
    page?: string
  }
}

async function getProducts(searchParams: any) {
  const params = new URLSearchParams()
  
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.append(key, value as string)
  })

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products?${params}`,
      { cache: 'no-store' }
    )
    
    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText)
      return { products: [], pagination: { page: 1, limit: 12, total: 0, pages: 0 } }
    }
    
    return response.json()
  } catch (error) {
    console.error('Fetch error:', error)
    return { products: [], pagination: { page: 1, limit: 12, total: 0, pages: 0 } }
  }
}

export default async function ProductGrid({ searchParams }: ProductGridProps) {
  const { products, pagination } = await getProducts(searchParams)

  if (!products?.length) {
    return (
      <div className="text-center py-12">
        <h3 className="font-serif text-xl mb-4">No products found</h3>
        <p className="text-gray-600">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/products?${new URLSearchParams({ ...searchParams, page: page.toString() })}`}
              className={`px-4 py-2 rounded-lg ${
                page === pagination.page
                  ? 'bg-brand-900 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.inventoryCount, 0)
  const isInStock = totalStock > 0

  return (
    <Link href={`/products/${product.id}`} className="product-card group">
      <div className="relative h-64 overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        {!isInStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg font-medium mb-2 group-hover:text-accent-400 transition-colors">
          {product.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">KES {product.price.toLocaleString()}</span>
          <span className={`text-sm ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
            {isInStock ? `${totalStock} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>
    </Link>
  )
}