import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface CheckoutItem {
  variantId: string
  quantity: number
  price: number
}

export async function POST(request: NextRequest) {
  try {
    const { items, shippingAddress, total } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      )
    }

    if (!shippingAddress || !total) {
      return NextResponse.json(
        { error: 'Shipping address and total are required' },
        { status: 400 }
      )
    }

    // Validate inventory availability
    for (const item of items) {
      const variant = await prisma.variant.findUnique({
        where: { id: item.variantId }
      })
      
      if (!variant) {
        return NextResponse.json(
          { error: `Variant ${item.variantId} not found` },
          { status: 404 }
        )
      }
      
      if (variant.inventoryCount < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient inventory for ${variant.sku}` },
          { status: 400 }
        )
      }
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        status: 'PENDING',
        total,
        shippingAddress: JSON.stringify(shippingAddress),
        items: {
          create: items.map((item: CheckoutItem) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      }
    })

    // Reserve inventory (decrement will happen on payment success)
    for (const item of items) {
      await prisma.inventoryLog.create({
        data: {
          variantId: item.variantId,
          change: -item.quantity,
          reason: 'Order created - inventory reserved',
          source: 'CHECKOUT'
        }
      })
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      total: order.total
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    )
  }
}