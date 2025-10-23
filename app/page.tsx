import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-brand-900 to-brand-900/80 flex items-center">
        <div className="container mx-auto px-4 text-white">
          <h1 className="font-serif text-5xl font-bold mb-4">
            Exquisite Kenyan Jewellery
          </h1>
          <p className="text-xl mb-8 max-w-2xl">
            Discover handcrafted pieces that tell stories of heritage, beauty, and craftsmanship.
          </p>
          <Link href="/products" className="btn-accent">
            Shop Collections
          </Link>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">
            Featured Collections
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Gold Rings', image: '/api/placeholder/400/300', count: '24 pieces' },
              { name: 'Silver Necklaces', image: '/api/placeholder/400/300', count: '18 pieces' },
              { name: 'Gemstone Earrings', image: '/api/placeholder/400/300', count: '32 pieces' },
            ].map((collection) => (
              <div key={collection.name} className="product-card">
                <div className="h-48 bg-gray-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-serif text-xl font-bold">{collection.name}</h3>
                    <p className="text-sm">{collection.count}</p>
                  </div>
                </div>
                <div className="p-4">
                  <Link href={`/products?category=${collection.name.toLowerCase().replace(' ', '-')}`} 
                        className="text-brand-900 hover:text-accent-400 font-medium">
                    View Collection →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  )
}