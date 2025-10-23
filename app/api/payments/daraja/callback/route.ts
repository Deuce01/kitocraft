import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json()
    
    const { Body } = callbackData
    const { stkCallback } = Body
    
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = stkCallback

    // Find payment by CheckoutRequestID
    const payment = await prisma.payment.findFirst({
      where: {
        externalTxnId: CheckoutRequestID
      },
      include: {
        order: true
      }
    })

    if (!payment) {
      console.error('Payment not found for CheckoutRequestID:', CheckoutRequestID)
      return NextResponse.json({ success: false })
    }

    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata?.Item || []
      const mpesaReceiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value
      const transactionDate = metadata.find((item: any) => item.Name === 'TransactionDate')?.Value
      const phoneNumber = metadata.find((item: any) => item.Name === 'PhoneNumber')?.Value

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          externalTxnId: mpesaReceiptNumber || CheckoutRequestID
        }
      })

      // Update order status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PROCESSING'
        }
      })

      // Decrement inventory for order items
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: payment.orderId }
      })

      for (const item of orderItems) {
        await prisma.variant.update({
          where: { id: item.variantId },
          data: {
            inventoryCount: {
              decrement: item.quantity
            }
          }
        })

        // Log inventory change
        await prisma.inventoryLog.create({
          data: {
            variantId: item.variantId,
            change: -item.quantity,
            reason: 'Order payment completed',
            source: 'DARAJA_CALLBACK'
          }
        })
      }

      console.log('Payment successful:', {
        orderId: payment.orderId,
        mpesaReceiptNumber,
        amount: payment.amount
      })

    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED'
        }
      })

      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'CANCELLED'
        }
      })

      console.log('Payment failed:', {
        orderId: payment.orderId,
        resultCode: ResultCode,
        resultDesc: ResultDesc
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Daraja callback error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}