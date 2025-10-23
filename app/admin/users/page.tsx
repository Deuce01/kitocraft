import { prisma } from '@/lib/prisma'

async function getUsers() {
  return prisma.user.findMany({
    include: {
      orders: {
        select: {
          id: true,
          total: true,
          status: true
        }
      },
      _count: {
        select: {
          orders: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-8">Users</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => {
              const totalSpent = user.orders
                .filter(order => order.status === 'DELIVERED')
                .reduce((sum, order) => sum + Number(order.total), 0)
              
              return (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{user.name || 'No name'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.phone && (
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'STAFF' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user._count.orders} orders
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    KES {totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
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