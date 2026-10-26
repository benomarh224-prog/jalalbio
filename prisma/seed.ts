import { db } from '../src/lib/db'
import { catalogCategories, catalogProducts } from '../src/lib/catalog'

async function main() {
  const categories = catalogCategories.map((category) => ({
    id: category.id,
    name: category.name,
    nameAr: category.nameAr,
    slug: category.slug,
    icon: category.icon,
  }))
  await db.category.createMany({ data: categories, skipDuplicates: true })

  const products = catalogProducts.map((product) => ({
    id: product.id,
    name: product.name,
    nameAr: product.nameAr,
    description: product.description,
    descriptionAr: product.descriptionAr,
    price: product.price,
    oldPrice: product.oldPrice,
    unit: product.unit,
    image: product.image,
    categoryId: product.categoryId,
    stock: product.stock,
    featured: product.featured,
    rating: product.rating,
    reviews: product.reviews,
    origin: product.origin,
  }))
  await db.product.createMany({ data: products, skipDuplicates: true })

  console.log('Catalog seeded without changing existing products or orders.')
}

main()
  .catch((error) => {
    console.error('Database seed failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.$disconnect()
  })
