'use client'

import { useState, useEffect } from 'react'
import { getCart } from '@/lib/cart'

export default function CartCounter() {
  const [itemCount, setItemCount] = useState(0)

  useEffect(() => {
    const updateCount = () => {
      const cart = getCart()
      setItemCount(cart.itemCount)
    }

    updateCount()
    
    // Listen for cart updates
    const handleStorageChange = () => updateCount()
    window.addEventListener('storage', handleStorageChange)
    
    // Custom event for same-tab updates
    window.addEventListener('cartUpdated', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', handleStorageChange)
    }
  }, [])

  if (itemCount === 0) return null

  return (
    <span className="absolute -top-2 -right-2 bg-accent-500 text-brand-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {itemCount > 9 ? '9+' : itemCount}
    </span>
  )
}