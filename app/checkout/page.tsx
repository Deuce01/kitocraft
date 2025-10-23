'use client'

import { useState, useEffect } from 'react'
import { getCart, clearCart, type Cart } from '@/lib/cart'

interface ShippingAddress {
  name: string
  phone: string
  line1: string
  line2: string
  city: string
  county: string
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState(1) // 1: Address, 2: Payment
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    county: ''
  })

  useEffect(() => {
    setCart(getCart())
    setIsLoading(false)
  }, [])

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handlePayment = async (method: 'DARAJA' | 'PESAPAL') => {
    setIsProcessing(true)
    
    try {
      // Create order
      const orderResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price
          })),
          shippingAddress,
          total: cart.total
        })
      })
      
      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }
      
      const { orderId } = await orderResponse.json()
      
      if (method === 'DARAJA') {
        // Initiate M-Pesa payment
        const paymentResponse = await fetch('/api/payments/daraja/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            phoneNumber: shippingAddress.phone,
            amount: cart.total
          })
        })
        
        if (!paymentResponse.ok) {
          throw new Error('Failed to initiate payment')
        }
        
        const { checkoutRequestId } = await paymentResponse.json()
        
        alert(`M-Pesa payment initiated! Check your phone for the payment prompt. Request ID: ${checkoutRequestId}`)
        
        // Clear cart and redirect
        clearCart()
        window.location.href = `/orders/${orderId}`
        
      } else {
        // Handle other payment methods
        alert('Payment method not yet implemented')
      }
      
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="font-serif text-3xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-600">Your cart is empty</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div>
          {step === 1 && (
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <h2 className="font-serif text-xl font-bold mb-4">Shipping Address</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, name: e.target.value }))}
                  className="border rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number (254...)"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                  className="border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <input
                type="text"
                placeholder="Address Line 1"
                value={shippingAddress.line1}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, line1: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
              
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={shippingAddress.line2}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, line2: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
              />
              
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="border rounded-lg px-3 py-2"
                  required
                />
                <select
                  value={shippingAddress.county}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, county: e.target.value }))}
                  className="border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select County</option>
                  <option value="Nairobi">Nairobi</option>
                  <option value="Mombasa">Mombasa</option>
                  <option value="Kiambu">Kiambu</option>
                  <option value="Nakuru">Nakuru</option>
                </select>
              </div>
              
              <button type="submit" className="btn-primary w-full">
                Continue to Payment
              </button>
            </form>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-bold mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => handlePayment('DARAJA')}
                  disabled={isProcessing}
                  className="w-full p-4 border-2 border-green-500 rounded-lg hover:bg-green-50 disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold">
                      M
                    </div>
                    <div className="text-left">
                      <div className="font-medium">M-Pesa</div>
                      <div className="text-sm text-gray-600">Pay with your M-Pesa account</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handlePayment('PESAPAL')}
                  disabled={isProcessing}
                  className="w-full p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold">
                      P
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Card Payment</div>
                      <div className="text-sm text-gray-600">Pay with Visa, Mastercard</div>
                    </div>
                  </div>
                </button>
              </div>
              
              <button
                onClick={() => setStep(1)}
                className="text-brand-900 hover:underline"
              >
                ← Back to Address
              </button>
            </div>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg h-fit">
          <h2 className="font-serif text-xl font-bold mb-4">Order Summary</h2>
          
          <div className="space-y-3 mb-4">
            {cart.items.map((item) => (
              <div key={item.variantId} className="flex justify-between text-sm">
                <span>{item.title} × {item.quantity}</span>
                <span>KES {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>KES {cart.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>KES {cart.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}