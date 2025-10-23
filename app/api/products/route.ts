import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const q = searchParams.get('q')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category
          }
        }
      }
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } }
      ]
    }

    if (priceMin || priceMax) {
      where.price = {}
      if (priceMin) where.price.gte = parseFloat(priceMin)
      if (priceMax) where.price.lte = parseFloat(priceMax)
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: {
            select: {
              id: true,
              sku: true,
              attributes: true,
              inventoryCount: true,
              priceDelta: true
            }
          },
          categories: {
            include: {
              category: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ])

    // Parse JSON fields and convert Decimals for response
    const processedProducts = products.map(product => ({
      ...product,
      price: Number(product.price),
      listPrice: product.listPrice ? Number(product.listPrice) : null,
      images: JSON.parse(product.images || '[]'),
      videos: product.videos ? JSON.parse(product.videos) : [],
      variants: product.variants.map(v => ({
        ...v,
        priceDelta: Number(v.priceDelta)
      }))
    }))

    return NextResponse.json({
      products: processedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}