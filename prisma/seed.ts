import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Miniatures & Figurines', slug: 'miniatures-figurines' }
    }),
    prisma.category.create({
      data: { name: 'Home Decor', slug: 'home-decor' }
    }),
    prisma.category.create({
      data: { name: 'Custom Parts', slug: 'custom-parts' }
    }),
    prisma.category.create({
      data: { name: 'Prototypes', slug: 'prototypes' }
    })
  ])

  // Create sample products
  const products = [
    {
      sku: 'MF001',
      title: 'Dragon Miniature Figure',
      description: 'Detailed 3D printed dragon miniature for gaming and display',
      price: 1500,
      listPrice: 2000,
      images: JSON.stringify(['/images/dragon-miniature-1.jpg', '/images/dragon-miniature-2.jpg']),
      categoryId: categories[0].id
    },
    {
      sku: 'HD001', 
      title: 'Modern Vase Design',
      description: 'Contemporary 3D printed vase with geometric patterns',
      price: 3500,
      images: JSON.stringify(['/images/modern-vase-1.jpg']),
      categoryId: categories[1].id
    },
    {
      sku: 'CP001',
      title: 'Custom Phone Stand',
      description: 'Personalized 3D printed phone stand with custom engraving',
      price: 800,
      images: JSON.stringify(['/images/phone-stand-1.jpg']),
      categoryId: categories[2].id
    },
    {
      sku: 'PR001',
      title: 'Product Prototype Model',
      description: 'High-precision 3D printed prototype for product development',
      price: 5000,
      images: JSON.stringify(['/images/prototype-1.jpg']),
      categoryId: categories[3].id
    }
  ]

  for (const productData of products) {
    const { categoryId, ...data } = productData
    
    const product = await prisma.product.create({
      data
    })

    // Create product-category relationship
    await prisma.productCategory.create({
      data: {
        productId: product.id,
        categoryId
      }
    })

    // Create variants
    await prisma.variant.create({
      data: {
        productId: product.id,
        sku: `${product.sku}-DEFAULT`,
        attributes: JSON.stringify({ size: 'Standard', material: 'PLA', color: 'White' }),
        priceDelta: 0,
        inventoryCount: Math.floor(Math.random() * 20) + 5
      }
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })