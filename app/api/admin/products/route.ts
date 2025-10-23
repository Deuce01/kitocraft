import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { sku, title, description, price, listPrice, images, inventoryCount } = await request.json()

    if (!sku || !title || !price) {
      return NextResponse.json(
        { error: 'SKU, title, and price are required' },
        { status: 400 }
      )
    }

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 409 }
      )
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        sku,
        title,
        description: description || null,
        price,
        listPrice: listPrice || null,
        images: JSON.stringify(images || []),
        isActive: true
      }
    })

    // Create default variant
    await prisma.variant.create({
      data: {
        productId: product.id,
        sku: `${sku}-DEFAULT`,
        attributes: JSON.stringify({ size: 'Standard' }),
        priceDelta: 0,
        inventoryCount: inventoryCount || 0
      }
    })

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        sku: product.sku,
        title: product.title
      }
    })

  } catch (error) {
    console.error('Admin product creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}