import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        categories: {
          include: { category: true }
        }
      }
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields and convert Decimals
    const processedProduct = {
      ...product,
      price: Number(product.price),
      listPrice: product.listPrice ? Number(product.listPrice) : null,
      images: JSON.parse(product.images || '[]'),
      videos: product.videos ? JSON.parse(product.videos) : [],
      variants: product.variants?.map(v => ({
        ...v,
        priceDelta: Number(v.priceDelta)
      })) || []
    }

    return NextResponse.json(processedProduct)

  } catch (error) {
    console.error('Product API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}