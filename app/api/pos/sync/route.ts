import { NextRequest, NextResponse } from 'next/server'
import { syncFromLoyverse } from '@/lib/loyverse'
import { prisma } from '@/lib/prisma'

// Manual sync endpoint
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const apiKey = request.headers.get('x-api-key')
    
    // Simple API key authentication
    if (apiKey !== process.env.LOYVERSE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await syncFromLoyverse()
    
    return NextResponse.json({
      success: true,
      synced: result.synced,
      errors: result.errors,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('POS sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Webhook endpoint for Loyverse notifications
export async function PUT(request: NextRequest) {
  try {
    const webhookData = await request.json()
    
    // Verify webhook signature if configured
    const signature = request.headers.get('x-loyverse-signature')
    // TODO: Implement signature verification
    
    // Handle different webhook events
    const { event_type, data } = webhookData
    
    switch (event_type) {
      case 'product.updated':
      case 'product.created':
        await handleProductUpdate(data)
        break
        
      case 'inventory.updated':
        await handleInventoryUpdate(data)
        break
        
      default:
        console.log('Unhandled webhook event:', event_type)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleProductUpdate(productData: any) {
  // Update single product from webhook
  const product = await prisma.product.findUnique({
    where: { sku: productData.reference_id || productData.handle }
  })
  
  if (product) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        title: productData.item_name,
        price: productData.price,
        images: productData.image_url ? JSON.stringify([productData.image_url]) : product.images
      }
    })
  }
}

async function handleInventoryUpdate(inventoryData: any) {
  // Update inventory from webhook
  const { product_id, store_id, stock_quantity } = inventoryData
  
  const variant = await prisma.variant.findFirst({
    where: {
      product: {
        sku: product_id
      },
      attributes: {
        contains: store_id
      }
    }
  })
  
  if (variant) {
    const oldStock = variant.inventoryCount
    const newStock = stock_quantity || 0
    const change = newStock - oldStock
    
    if (change !== 0) {
      await prisma.variant.update({
        where: { id: variant.id },
        data: { inventoryCount: newStock }
      })
      
      await prisma.inventoryLog.create({
        data: {
          variantId: variant.id,
          change,
          reason: 'Loyverse webhook update',
          source: 'LOYVERSE_WEBHOOK'
        }
      })
    }
  }
}