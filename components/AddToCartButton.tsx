'use client'

import { useState } from 'react'
import { addToCart } from '@/lib/cart'

interface Variant {
  id: string
  sku: string
  priceDelta: number
  inventoryCount: number
}

interface AddToCartButtonProps {
  productId: string
  variants: Variant[]
  disabled?: boolean
}

export default function AddToCartButton({ productId, variants, disabled }: AddToCartButtonProps) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]?.id || '')
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    if (!selectedVariant || disabled) return
    
    setIsAdding(true)
    
    try {
      // Get variant details
      const variant = variants.find(v => v.id === selectedVariant)
      if (!variant) return
      
      // Get product details for cart item
      const response = await fetch(`/api/products/${productId}`)
      const product = await response.json()
      
      addToCart({
        variantId: variant.id,
        productId,
        price: Number(product.price) + Number(variant.priceDelta),
        title: product.title,
        sku: variant.sku,
        image: product.images?.[0]
      }, quantity)
      
      // Show success feedback
      alert('Added to cart!')
      
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('Failed to add to cart')
    } finally {
      setIsAdding(false)
    }
  }

  if (variants.length === 0) {
    return (
      <button disabled className="btn-primary opacity-50 cursor-not-allowed">
        No variants available
      </button>
    )
  }

  const selectedVariantData = variants.find(v => v.id === selectedVariant)
  const maxQuantity = selectedVariantData?.inventoryCount || 0

  return (
    <div className="space-y-4">
      {variants.length > 1 && (
        <div>
          <label className="block text-sm font-medium mb-2">Select Option</label>
          <select
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.sku} - {variant.inventoryCount} available
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-2">Quantity</label>
        <input
          type="number"
          min="1"
          max={maxQuantity}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
          className="w-20 border rounded-lg px-3 py-2"
        />
      </div>
      
      <button
        onClick={handleAddToCart}
        disabled={disabled || isAdding || !selectedVariant}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
          disabled || !selectedVariant
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-brand-900 text-white hover:bg-opacity-90'
        }`}
      >
        {isAdding ? 'Adding...' : disabled ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  )
}