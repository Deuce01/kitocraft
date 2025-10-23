import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Rings', slug: 'rings' }
    }),
    prisma.category.create({
      data: { name: 'Necklaces', slug: 'necklaces' }
    }),
    prisma.category.create({
      data: { name: 'Earrings', slug: 'earrings' }
    }),
    prisma.category.create({
      data: { name: 'Bracelets', slug: 'bracelets' }
    })
  ])

  // Create sample products
  const products = [
    {
      sku: 'GR001',
      title: 'Gold Diamond Ring',
      description: 'Beautiful 18k gold ring with diamond setting',
      price: 45000,
      listPrice: 50000,
      images: JSON.stringify(['/images/gold-ring-1.jpg', '/images/gold-ring-2.jpg']),
      categoryId: categories[0].id
    },
    {
      sku: 'SN001', 
      title: 'Silver Pearl Necklace',
      description: 'Elegant silver necklace with freshwater pearls',
      price: 15000,
      images: JSON.stringify(['/images/silver-necklace-1.jpg']),
      categoryId: categories[1].id
    },
    {
      sku: 'GE001',
      title: 'Gold Stud Earrings',
      description: 'Classic gold stud earrings with cubic zirconia',
      price: 8500,
      images: JSON.stringify(['/images/gold-earrings-1.jpg']),
      categoryId: categories[2].id
    },
    {
      sku: 'SB001',
      title: 'Silver Chain Bracelet',
      description: 'Delicate silver chain bracelet with charm',
      price: 6500,
      images: JSON.stringify(['/images/silver-bracelet-1.jpg']),
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
        attributes: JSON.stringify({ size: 'Standard', material: 'Default' }),
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