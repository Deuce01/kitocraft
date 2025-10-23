import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const variants = await prisma.variant.findMany({
      include: {
        product: {
          select: {
            title: true,
            price: true
          }
        }
      },
      orderBy: {
        product: {
          title: 'asc'
        }
      }
    })

    return NextResponse.json({ variants })
  } catch (error) {
    console.error('Inventory fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { variantId, inventoryCount } = await request.json()

    if (!variantId || inventoryCount < 0) {
      return NextResponse.json(
        { error: 'Valid variant ID and inventory count required' },
        { status: 400 }
      )
    }

    const variant = await prisma.variant.findUnique({
      where: { id: variantId }
    })

    if (!variant) {
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      )
    }

    const oldStock = variant.inventoryCount
    const change = inventoryCount - oldStock

    // Update variant inventory
    await prisma.variant.update({
      where: { id: variantId },
      data: { inventoryCount }
    })

    // Log inventory change
    if (change !== 0) {
      await prisma.inventoryLog.create({
        data: {
          variantId,
          change,
          reason: 'Admin manual adjustment',
          source: 'ADMIN_PANEL'
        }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Inventory update error:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    )
  }
}