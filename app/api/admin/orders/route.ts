import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
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

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}