export interface CartItem {
  variantId: string
  productId: string
  quantity: number
  price: number
  title: string
  sku: string
  image?: string
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}

const CART_KEY = 'kitocraft_cart'

export function getCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], total: 0, itemCount: 0 }
  }
  
  try {
    const stored = localStorage.getItem(CART_KEY)
    if (!stored) return { items: [], total: 0, itemCount: 0 }
    
    const cart = JSON.parse(stored)
    return calculateCartTotals(cart.items || [])
  } catch {
    return { items: [], total: 0, itemCount: 0 }
  }
}

export function addToCart(item: Omit<CartItem, 'quantity'>, quantity: number = 1): Cart {
  const cart = getCart()
  const existingIndex = cart.items.findIndex(i => i.variantId === item.variantId)
  
  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += quantity
  } else {
    cart.items.push({ ...item, quantity })
  }
  
  const updatedCart = calculateCartTotals(cart.items)
  saveCart(updatedCart)
  return updatedCart
}

export function removeFromCart(variantId: string): Cart {
  const cart = getCart()
  cart.items = cart.items.filter(item => item.variantId !== variantId)
  
  const updatedCart = calculateCartTotals(cart.items)
  saveCart(updatedCart)
  return updatedCart
}

export function updateQuantity(variantId: string, quantity: number): Cart {
  const cart = getCart()
  const item = cart.items.find(i => i.variantId === variantId)
  
  if (item) {
    if (quantity <= 0) {
      return removeFromCart(variantId)
    }
    item.quantity = quantity
  }
  
  const updatedCart = calculateCartTotals(cart.items)
  saveCart(updatedCart)
  return updatedCart
}

export function clearCart(): Cart {
  const emptyCart = { items: [], total: 0, itemCount: 0 }
  saveCart(emptyCart)
  return emptyCart
}

function calculateCartTotals(items: CartItem[]): Cart {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  
  return { items, total, itemCount }
}

function saveCart(cart: Cart): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }
}