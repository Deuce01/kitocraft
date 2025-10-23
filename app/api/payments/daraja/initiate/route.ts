import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface DarajaSTKRequest {
  orderId: string
  phoneNumber: string
  amount: number
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, phoneNumber, amount }: DarajaSTKRequest = await request.json()

    // Validate order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Get Daraja access token
    const accessToken = await getDarajaAccessToken()
    
    // Format phone number (remove + and ensure 254 prefix)
    const formattedPhone = formatPhoneNumber(phoneNumber)
    
    // STK Push request
    const stkPushResponse = await initiateSTKPush({
      accessToken,
      phoneNumber: formattedPhone,
      amount,
      orderId,
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/daraja/callback`
    })

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        gateway: 'DARAJA',
        status: 'PENDING',
        amount,
        externalTxnId: stkPushResponse.CheckoutRequestID
      }
    })

    return NextResponse.json({
      success: true,
      checkoutRequestId: stkPushResponse.CheckoutRequestID,
      paymentId: payment.id
    })

  } catch (error) {
    console.error('Daraja initiate error:', error)
    return NextResponse.json(
      { error: 'Payment initiation failed' },
      { status: 500 }
    )
  }
}

async function getDarajaAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`
  ).toString('base64')

  const response = await fetch(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const data = await response.json()
  return data.access_token
}

function formatPhoneNumber(phone: string): string {
  // Remove any non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // Handle different formats
  if (cleaned.startsWith('254')) {
    return cleaned
  } else if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1)
  } else if (cleaned.length === 9) {
    return '254' + cleaned
  }
  
  return cleaned
}

async function initiateSTKPush({
  accessToken,
  phoneNumber,
  amount,
  orderId,
  callbackUrl
}: {
  accessToken: string
  phoneNumber: string
  amount: number
  orderId: string
  callbackUrl: string
}) {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
  const password = Buffer.from(
    `${process.env.DARAJA_BUSINESS_SHORT_CODE}${process.env.DARAJA_PASSKEY}${timestamp}`
  ).toString('base64')

  const response = await fetch(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.DARAJA_BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: process.env.DARAJA_BUSINESS_SHORT_CODE,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: orderId,
        TransactionDesc: `Payment for order ${orderId}`
      })
    }
  )

  return response.json()
}