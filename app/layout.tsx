import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import CartCounter from '@/components/CartCounter'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'KitoCraft Jewellery - Premium Kenyan Jewellery',
  description: 'Discover exquisite handcrafted jewellery from Kenya. Premium gold, silver, and gemstone pieces.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans bg-white text-gray-900">
        <header className="bg-brand-900 text-white">
          <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="font-serif text-2xl font-bold">KitoCraft</h1>
            <div className="flex space-x-6 items-center">
              <a href="/" className="hover:text-accent-500">Home</a>
              <a href="/products" className="hover:text-accent-500">Collections</a>
              <a href="/cart" className="hover:text-accent-500 relative">
                Cart
                <CartCounter />
              </a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}