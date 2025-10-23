'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getCart, updateQuantity, removeFromCart, type Cart } from '@/lib/cart'

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setCart(getCart())
    setIsLoading(false)
  }, [])

  const handleUpdateQuantity = (variantId: string, quantity: number) => {
    const updatedCart = updateQuantity(variantId, quantity)
    setCart(updatedCart)
  }

  const handleRemoveItem = (variantId: string) => {
    const updatedCart = removeFromCart(variantId)
    setCart(updatedCart)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="font-serif text-3xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-600 mb-8">Your cart is empty</p>
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold mb-8">Your Cart ({cart.itemCount} items)</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.variantId} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-20 h-20 relative bg-gray-100 rounded overflow-hidden">
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                    No Image
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                <p className="font-medium">KES {item.price.toLocaleString()}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateQuantity(item.variantId, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.variantId, item.quantity + 1)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              
              <div className="text-right">
                <p className="font-medium">KES {(item.price * item.quantity).toLocaleString()}</p>
                <button
                  onClick={() => handleRemoveItem(item.variantId)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg h-fit">
          <h2 className="font-serif text-xl font-bold mb-4">Order Summary</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>KES {cart.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>KES {cart.total.toLocaleString()}</span>
            </div>
          </div>
          
          <Link href="/checkout" className="btn-primary w-full block text-center">
            Proceed to Checkout
          </Link>
          
          <Link href="/products" className="block text-center text-brand-900 hover:underline mt-4">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}