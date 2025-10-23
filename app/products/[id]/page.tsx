import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AddToCartButton from '@/components/AddToCartButton'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
      categories: {
        include: { category: true }
      }
    }
  })
  
  if (!product || !product.isActive) {
    return null
  }
  
  return {
    ...product,
    price: Number(product.price),
    listPrice: product.listPrice ? Number(product.listPrice) : null,
    images: JSON.parse(product.images || '[]'),
    videos: product.videos ? JSON.parse(product.videos) : [],
    variants: product.variants.map(v => ({
      ...v,
      priceDelta: Number(v.priceDelta)
    }))
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)
  
  if (!product) {
    notFound()
  }

  const totalStock = product.variants.reduce((sum, v) => sum + v.inventoryCount, 0)
  const isInStock = totalStock > 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image Available
              </div>
            )}
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((image: string, index: number) => (
                <div key={index} className="aspect-square relative bg-gray-100 rounded overflow-hidden">
                  <Image src={image} alt={`${product.title} ${index + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-3xl font-bold mb-2">{product.title}</h1>
            <p className="text-gray-600">SKU: {product.sku}</p>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold">KES {product.price.toLocaleString()}</span>
            {product.listPrice && product.listPrice > product.price && (
              <span className="text-xl text-gray-500 line-through">
                KES {product.listPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className={`inline-block px-3 py-1 rounded-full text-sm ${
            isInStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isInStock ? `${totalStock} in stock` : 'Out of stock'}
          </div>

          {product.description && (
            <div>
              <h3 className="font-serif text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.variants.length > 0 && (
            <div>
              <h3 className="font-serif text-lg font-medium mb-3">Available Options</h3>
              <div className="space-y-2">
                {product.variants.map((variant) => {
                  const attrs = JSON.parse(variant.attributes || '{}')
                  return (
                    <div key={variant.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{variant.sku}</span>
                        {Object.entries(attrs).map(([key, value]) => (
                          <span key={key} className="ml-2 text-sm text-gray-600">
                            {key}: {value as string}
                          </span>
                        ))}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          KES {(Number(product.price) + Number(variant.priceDelta)).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {variant.inventoryCount} available
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <AddToCartButton 
            productId={product.id}
            variants={product.variants}
            disabled={!isInStock}
          />

          {product.categories.length > 0 && (
            <div>
              <h3 className="font-serif text-lg font-medium mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {product.categories.map(({ category }) => (
                  <span key={category.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}