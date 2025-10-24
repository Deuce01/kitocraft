'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  sku: string
  title: string
  description: string | null
  price: number
  listPrice: number | null
  images: string
  isActive: boolean
  variants: Array<{
    id: string
    inventoryCount: number
  }>
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    sku: '',
    title: '',
    description: '',
    price: '',
    listPrice: '',
    images: '',
    inventoryCount: '0',
    isActive: true
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
        const images = JSON.parse(data.images || '[]')
        setFormData({
          sku: data.sku,
          title: data.title,
          description: data.description || '',
          price: data.price.toString(),
          listPrice: data.listPrice?.toString() || '',
          images: images.join(', '),
          inventoryCount: data.variants[0]?.inventoryCount?.toString() || '0',
          isActive: data.isActive
        })
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          listPrice: formData.listPrice ? parseFloat(formData.listPrice) : null,
          images: formData.images.split(',').map(url => url.trim()).filter(Boolean),
          inventoryCount: parseInt(formData.inventoryCount)
        })
      })

      if (response.ok) {
        alert('Product updated successfully!')
        router.push('/admin/products')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update product')
      }
    } catch (error) {
      alert('Error updating product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Product deleted successfully!')
        router.push('/admin/products')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete product')
      }
    } catch (error) {
      alert('Error deleting product')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-12">Loading...</div>
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="mt-2 text-sm text-gray-600">Update product information</p>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
        >
          Delete Product
        </button>
      </div>
      
      <div className="bg-white shadow sm:rounded-lg">
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">SKU *</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (KES) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">List Price (KES)</label>
              <input
                type="number"
                value={formData.listPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, listPrice: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              value={formData.inventoryCount}
              onChange={(e) => setFormData(prev => ({ ...prev, inventoryCount: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image URLs</label>
            <input
              type="text"
              value={formData.images}
              onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-900 hover:bg-brand-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}