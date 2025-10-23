import { prisma } from '@/lib/prisma'

async function getOrders() {
  return prisma.order.findMany({
    include: {
      user: {
        select: { name: true, email: true }
      },
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: { title: true }
              }
            }
          }
        }
      },
      payments: {
        select: { gateway: true, status: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

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
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
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