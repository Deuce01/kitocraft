import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        variants: {
          select: {
            id: true,
            inventoryCount: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { sku, title, description, price, listPrice, images, inventoryCount, isActive } = await request.json()

    if (!sku || !title || !price) {
      return NextResponse.json({ error: 'SKU, title, and price are required' }, { status: 400 })
    }

    // Check if SKU exists for other products
    const existingProduct = await prisma.product.findFirst({
      where: { 
        sku,
        NOT: { id: params.id }
      }
    })

    if (existingProduct) {
      return NextResponse.json({ error: 'SKU already exists for another product' }, { status: 409 })
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        sku,
        title,
        description: description || null,
        price,
        listPrice: listPrice || null,
        images: JSON.stringify(images || []),
        isActive
      }
    })

    // Update variant inventory
    await prisma.variant.updateMany({
      where: { productId: params.id },
      data: { inventoryCount }
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Delete variants first (foreign key constraint)
    await prisma.variant.deleteMany({
      where: { productId: params.id }
    })

    // Delete product
    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}