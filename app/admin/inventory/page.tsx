'use client'

import { useState, useEffect } from 'react'

interface InventoryItem {
  id: string
  sku: string
  inventoryCount: number
  product: {
    title: string
    price: number
  }
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updateStock, setUpdateStock] = useState<{[key: string]: string}>({})

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/admin/inventory')
      const data = await response.json()
      setInventory(data.variants || [])
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStockUpdate = async (variantId: string) => {
    const newStock = parseInt(updateStock[variantId] || '0')
    
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          inventoryCount: newStock
        })
      })

      if (response.ok) {
        fetchInventory()
        setUpdateStock(prev => ({ ...prev, [variantId]: '' }))
        alert('Stock updated successfully!')
      } else {
        alert('Failed to update stock')
      }
    } catch (error) {
      alert('Error updating stock')
    }
  }

  if (isLoading) {
    return <div>Loading inventory...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl font-bold">Inventory Management</h1>
        <button
          onClick={fetchInventory}
          className="btn-accent"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Update Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{item.product.title}</div>
                    <div className="text-sm text-gray-500">KES {Number(item.product.price).toLocaleString()}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-mono">{item.sku}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    item.inventoryCount === 0 ? 'bg-red-100 text-red-800' :
                    item.inventoryCount < 5 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.inventoryCount}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    value={updateStock[item.id] || ''}
                    onChange={(e) => setUpdateStock(prev => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder={item.inventoryCount.toString()}
                    className="w-20 border rounded px-2 py-1 text-sm"
                    min="0"
                  />
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleStockUpdate(item.id)}
                    disabled={!updateStock[item.id]}
                    className="text-brand-900 hover:underline disabled:text-gray-400"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}