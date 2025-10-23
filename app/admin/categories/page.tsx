import { prisma } from '@/lib/prisma'

async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-8">Categories</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 font-medium">{category.name}</td>
                <td className="px-6 py-4 text-sm font-mono">{category.slug}</td>
                <td className="px-6 py-4 text-sm">{category._count.products} products</td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-brand-900 hover:underline mr-3">Edit</button>
                  <button className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}