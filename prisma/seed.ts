import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.product.deleteMany()
  await db.category.deleteMany()

  // Create categories
  const categories = await Promise.all([
    db.category.create({
      data: { name: 'Oils', nameAr: 'الزيوت', slug: 'oils', icon: 'Droplet' },
    }),
    db.category.create({
      data: { name: 'Honey', nameAr: 'العسل', slug: 'honey', icon: 'Sparkles' },
    }),
    db.category.create({
      data: { name: 'Dried Fruits', nameAr: 'الفواكه المجففة', slug: 'dried-fruits', icon: 'Apple' },
    }),
    db.category.create({
      data: { name: 'Pickles', nameAr: 'المخللات', slug: 'pickles', icon: 'Soup' },
    }),
    db.category.create({
      data: { name: 'Traditional', nameAr: 'التقليدية', slug: 'traditional', icon: 'Beef' },
    }),
    db.category.create({
      data: { name: 'Dairy', nameAr: 'منتجات الحليب', slug: 'dairy', icon: 'Milk' },
    }),
  ])

  const [oils, honey, driedFruits, pickles, traditional, dairy] = categories

  // Create products
  const products = [
    {
      name: 'Extra Virgin Olive Oil',
      nameAr: 'زيت الزيتون البكر الممتاز',
      description: 'Cold-pressed extra virgin olive oil from the Atlas mountains.',
      descriptionAr:
        'زيت زيتون بكر ممتاز معصور على البارد من جبال الأطلس. يتميز بنكهة الفاكهة الطازجة واللون الذهبي الأخضر. مثالي للسلطات والطبخ.',
      price: 120,
      oldPrice: 140,
      unit: 'لتر',
      image: '/products/olive-oil.png',
      categoryId: oils.id,
      stock: 80,
      featured: true,
      rating: 4.9,
      reviews: 124,
      origin: 'جبال الأطلس، مكناس',
    },
    {
      name: 'Pure Mountain Honey',
      nameAr: 'عسل الجبل الطبيعي',
      description: 'Raw wildflower honey harvested from Moroccan highlands.',
      descriptionAr:
        'عسل جبلي خام طبيعي 100%، يتم جمعه من مرتفعات المغرب. غني بالعناصر الغذائية ومضادات الأكسدة. لون ذهبي ونكهة غنية.',
      price: 95,
      oldPrice: 110,
      unit: '500غ',
      image: '/products/honey.png',
      categoryId: honey.id,
      stock: 65,
      featured: true,
      rating: 5.0,
      reviews: 89,
      origin: 'الأطلس المتوسط',
    },
    {
      name: 'Dried Figs',
      nameAr: 'التين المجفف',
      description: 'Sun-dried figs, naturally sweet and chewy.',
      descriptionAr:
        'تين مجفف بأشعة الشمس الطبيعية، حلو المذاق وطري الملمس. مصدر ممتاز للألياف والمعادن. وجبة خفيفة صحية ومغذية.',
      price: 60,
      oldPrice: null,
      unit: 'كغ',
      image: '/products/dried-figs.png',
      categoryId: driedFruits.id,
      stock: 100,
      featured: true,
      rating: 4.8,
      reviews: 56,
      origin: 'تازة، فاس',
    },
    {
      name: 'Moroccan Pickled Olives',
      nameAr: 'الزيتون المخلل المغربي',
      description: 'Mixed olives cured with lemon and Moroccan spices.',
      descriptionAr:
        'زيتون مخلل مغربي أصيل، ممزوج بالليمون والبهارات المغربية التقليدية. نكهة لاذعة ومنعشة. مثالي كوجبة خفيفة أو مع الأطباق.',
      price: 45,
      oldPrice: 55,
      unit: 'كغ',
      image: '/products/pickled-olives.png',
      categoryId: pickles.id,
      stock: 120,
      featured: true,
      rating: 4.7,
      reviews: 73,
      origin: 'مكناس',
    },
    {
      name: 'Moroccan Khli3',
      nameAr: 'الخليع المغربي',
      description: 'Traditional sun-dried cured beef preserved in fat.',
      descriptionAr:
        'خليع مغربي تقليدي، لحم بقري مجفف ومحفوظ في الدهن. وصفة عريقة تتميز بنكهة غنية مميزة. يقدم مع البيض والخبز أو في الطاجين.',
      price: 180,
      oldPrice: null,
      unit: 'كغ',
      image: '/products/khli3.png',
      categoryId: traditional.id,
      stock: 40,
      featured: true,
      rating: 4.9,
      reviews: 41,
      origin: 'فاس، مكناس',
    },
    {
      name: 'Mixed Raisins & Grapes',
      nameAr: 'العنب المشكل',
      description: 'Assortment of golden and dark seedless raisins.',
      descriptionAr:
        'مزيج من العنب المجفف الذهبي والداكن بدون بذور. حلو وطري، مثالي لل_snacks والحلويات والطبخ. غني بالطاقة والحديد.',
      price: 50,
      oldPrice: 65,
      unit: 'كغ',
      image: '/products/mixed-grapes.png',
      categoryId: driedFruits.id,
      stock: 90,
      featured: true,
      rating: 4.8,
      reviews: 38,
      origin: 'سوس، أكادير',
    },
    {
      name: 'Traditional Cow Butter (Smen)',
      nameAr: 'زبدة البقر البلدية (السمن)',
      description: 'Traditional Moroccan butter, creamy and rich.',
      descriptionAr:
        'زبدة بقر بلدية طبيعية، كريمية وغنية بالنكهة. تُصنع من حليب البقر الطازج في المزارع المغربية. مثالية للطبخ والمعجنات.',
      price: 70,
      oldPrice: null,
      unit: '500غ',
      image: '/products/cow-butter.png',
      categoryId: dairy.id,
      stock: 55,
      featured: true,
      rating: 4.9,
      reviews: 47,
      origin: 'الغرب، القنيطرة',
    },
  ]

  for (const product of products) {
    await db.product.create({
      data: {
        ...product,
        oldPrice: product.oldPrice ?? undefined,
        descriptionAr: product.descriptionAr ?? undefined,
      },
    })
  }

  // Create sample orders for dashboard
  const sampleOrders = [
    {
      orderNumber: 'CMD-1001',
      customerName: 'يوسف العلوي',
      phone: '0612345678',
      city: 'الدار البيضاء',
      address: 'حي المعاريف، شارع الزرقطوني 45',
      total: 215,
      status: 'delivered',
    },
    {
      orderNumber: 'CMD-1002',
      customerName: 'فاطمة الزهراء بنعلي',
      phone: '0623456789',
      city: 'الرباط',
      address: 'حي أكدال، زنقة فاس 12',
      total: 95,
      status: 'shipped',
    },
    {
      orderNumber: 'CMD-1003',
      customerName: 'عبد الرحيم التازي',
      phone: '0634567890',
      city: 'مراكش',
      address: 'حي جيليز، شارع محمد السادس 88',
      total: 360,
      status: 'confirmed',
    },
    {
      orderNumber: 'CMD-1004',
      customerName: 'خديجة الإدريسي',
      phone: '0645678901',
      city: 'فاس',
      address: 'حي النرجس، تجزئة الأمل 23',
      total: 130,
      status: 'pending',
    },
    {
      orderNumber: 'CMD-1005',
      customerName: 'محمد الأمين',
      phone: '0656789012',
      city: 'طنجة',
      address: 'حي إقامة الورود، عمارة 7 شقة 12',
      total: 250,
      status: 'delivered',
    },
  ]

  const allProducts = await db.product.findMany()
  for (const order of sampleOrders) {
    const created = await db.order.create({ data: order })
    // attach 1-2 random items
    const item1 = allProducts[Math.floor(Math.random() * allProducts.length)]
    const qty1 = 1 + Math.floor(Math.random() * 3)
    await db.orderItem.create({
      data: {
        orderId: created.id,
        productId: item1.id,
        quantity: qty1,
        price: item1.price,
        name: item1.nameAr,
        image: item1.image,
      },
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`   - ${categories.length} categories`)
  console.log(`   - ${products.length} products`)
  console.log(`   - ${sampleOrders.length} orders`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
