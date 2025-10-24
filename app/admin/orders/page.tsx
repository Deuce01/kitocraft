'use client'

import { useState, useEffect } from 'react'

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  shippingAddress: string
  user?: { name: string; email: string }
  items: Array<{
    variant: {
      product: { title: string }
    }
  }>
  payments: Array<{
    gateway: string
    status: string
  }>
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        ))
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12">Loading...</div>
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-8">Orders</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => {
              const shippingAddress = JSON.parse(order.shippingAddress || '{}')
              
              return (
                <tr key={order.id}>
                  <td className="px-6 py-4 text-sm font-mono">
                    {order.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <div className="font-medium">{order.user?.name || shippingAddress.name || 'Guest'}</div>
                      <div className="text-gray-500">{order.user?.email || shippingAddress.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    <div className="text-gray-500">
                      {order.items.slice(0, 2).map(item => 
                        item.variant.product.title
                      ).join(', ')}
                      {order.items.length > 2 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    KES {Number(order.total).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="text-xs rounded border-gray-300 focus:ring-brand-500 focus:border-brand-500"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {order.payments[0] ? (
                      <div>
                        <div className="font-medium">{order.payments[0].gateway}</div>
                        <div className={`text-xs ${
                          order.payments[0].status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {order.payments[0].status}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No payment</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}