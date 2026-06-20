require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { Category, Blog, Coupon, CmsPage } = require('../models/index');
const Product = require('../models/Product');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ziatraders');
  console.log('Connected to MongoDB');

  // Clear existing
  await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany(), Blog.deleteMany(), Coupon.deleteMany(), CmsPage.deleteMany()]);
  console.log('Cleared existing data');

  // Users
  const users = await User.create([
    { name: 'Super Admin', email: 'admin@ziatraders.pk', password: '123456', role: 'admin', isEmailVerified: true },
    { name: 'Ali Seller', email: 'seller@ziatraders.pk', password: '123456', role: 'seller', isEmailVerified: true },
    { name: 'Dr. Asif Khan', email: 'agronomist@ziatraders.pk', password: '123456', role: 'agronomist', phone: '+92-300-1234567', isEmailVerified: true },
    { name: 'Ahmed Customer', email: 'customer@ziatraders.pk', password: '123456', role: 'customer', isEmailVerified: true },
  ]);
  console.log('Users created:', users.map(u => u.email).join(', '));

  const seller = users.find(u => u.role === 'seller');

  // Categories
  const categories = await Category.create([
    { name: 'Pesticides',    slug: 'pesticides',    description: 'Insecticides, acaricides, nematicides' },
    { name: 'Fungicides',    slug: 'fungicides',    description: 'Fungal disease treatments' },
    { name: 'Herbicides',    slug: 'herbicides',    description: 'Weed killers and control' },
    { name: 'Fertilizers',   slug: 'fertilizers',   description: 'NPK and micronutrient fertilizers' },
    { name: 'Bio-Pesticides',slug: 'bio-pesticides',description: 'Organic and biological pest control' },
    { name: 'Seeds',         slug: 'seeds',         description: 'Certified crop seeds' },
  ]);
  console.log('Categories created');

  // Products
  const products = await Product.create([
    { name: 'Karate Insecticide 2.5% EC', sku: 'ZT-PEST-001', description: 'Lambda-cyhalothrin based broad-spectrum insecticide effective against a wide range of sucking and chewing pests in cotton, vegetables, and cereals.', price: 850, discountedPrice: 720, category: categories[0]._id, seller: seller._id, stock: 150, unit: 'bottle (250ml)', brand: 'Syngenta', cropTypes: ['Cotton','Wheat','Vegetables'], diseases: ['aphids','whitefly','thrips'], dosage: '0.5ml per litre of water', safetyInstructions: 'Wear protective gear. Keep away from children.', specifications: [{ key: 'Active Ingredient', value: 'Lambda-cyhalothrin 2.5%' }, { key: 'Volume', value: '250ml' }], isFeatured: true, isApproved: true, ratings: 4.5, numReviews: 24, salesCount: 89 },
    { name: 'Score 250 EC Fungicide', description: 'Difenoconazole fungicide for control of leaf spot, blight, and rust diseases in wheat, cotton, and vegetables.', price: 1200, category: categories[1]._id, seller: seller._id, stock: 80, unit: 'bottle (100ml)', brand: 'Syngenta', cropTypes: ['Wheat','Cotton','Tomato'], diseases: ['rust','blight','leaf-spot'], dosage: '1ml per litre of water', isFeatured: true, isApproved: true, ratings: 4.2, numReviews: 16, salesCount: 55 },
    { name: 'Roundup Herbicide', description: 'Glyphosate-based non-selective herbicide for effective weed management before crop emergence.', price: 650, discountedPrice: 580, category: categories[2]._id, seller: seller._id, stock: 200, unit: 'bottle (500ml)', brand: 'Bayer', cropTypes: ['Wheat','Rice','Maize'], diseases: ['weeds'], dosage: '3ml per litre of water', isFeatured: true, isApproved: true, ratings: 4.0, numReviews: 31, salesCount: 120 },
    { name: 'DAP Fertilizer (50 kg)', description: 'Di-Ammonium Phosphate (18-46-0) — premium phosphatic fertilizer for basal application in all field crops.', price: 7200, category: categories[3]._id, seller: seller._id, stock: 500, unit: '50 kg bag', brand: 'FFC', cropTypes: ['Wheat','Rice','Cotton','Maize','Sugarcane'], dosage: '50kg per acre', isFeatured: true, isApproved: true, ratings: 4.8, numReviews: 62, salesCount: 340 },
    { name: 'Confidor 200 SL', description: 'Imidacloprid systemic insecticide for control of sucking insects, particularly effective against BPH in rice.', price: 1450, category: categories[0]._id, seller: seller._id, stock: 60, unit: 'bottle (100ml)', brand: 'Bayer', cropTypes: ['Rice','Cotton','Vegetables'], diseases: ['BPH','jassids','thrips'], dosage: '0.3ml per litre', isFeatured: true, isApproved: true, ratings: 4.6, numReviews: 19, salesCount: 78 },
    { name: 'Ridomil Gold MZ Fungicide', description: 'Metalaxyl + Mancozeb systemic & contact fungicide for downy mildew, late blight and phytophthora diseases.', price: 980, category: categories[1]._id, seller: seller._id, stock: 90, unit: 'packet (100g)', brand: 'Syngenta', cropTypes: ['Potato','Tomato','Grapes'], diseases: ['late-blight','downy-mildew'], dosage: '2.5g per litre', isFeatured: true, isApproved: true, ratings: 4.3, numReviews: 11, salesCount: 44 },
    { name: 'Urea Fertilizer (50 kg)', description: 'Granular urea (46-0-0) nitrogen fertilizer for top dressing in all major crops.', price: 4800, category: categories[3]._id, seller: seller._id, stock: 800, unit: '50 kg bag', brand: 'FFBL', cropTypes: ['Wheat','Rice','Cotton','Maize','Sugarcane'], dosage: '50kg per acre', isApproved: true, ratings: 4.7, numReviews: 89, salesCount: 560 },
    { name: 'BioMax Organic Spray', description: 'Neem-based bio-pesticide safe for vegetables and organic farming. Controls aphids, mealybugs, and spider mites.', price: 420, category: categories[4]._id, seller: seller._id, stock: 120, unit: 'bottle (500ml)', brand: 'BioTech', cropTypes: ['Vegetables','Fruits','Orchards'], diseases: ['aphids','mealybugs','spider-mites'], dosage: '5ml per litre', isFeatured: true, isApproved: true, ratings: 4.1, numReviews: 28, salesCount: 67 },
  ]);
  console.log('Products created:', products.length);

  // Blog posts
  await Blog.create([
    { title: 'How to Identify and Treat Wheat Rust Disease', slug: 'wheat-rust-treatment', excerpt: 'Wheat rust is one of the most devastating diseases affecting wheat crops in Pakistan. Learn how to identify early symptoms and choose the right fungicide.', content: 'Wheat rust diseases include stem rust, yellow (stripe) rust, and leaf rust. Early symptoms include yellow or orange pustules on leaves and stems. Apply triazole-based fungicides like Score 250 EC at first sign of infection. Spray 2-3 times at 10-day intervals for best results.', category: 'Disease Guide', author: users[2]._id, tags: ['wheat','rust','fungicide'], isPublished: true, views: 342 },
    { title: 'Best Fertilizer Schedule for Cotton Crop in Pakistan', slug: 'cotton-fertilizer-schedule', excerpt: 'A comprehensive guide to fertilizer application timings and doses for maximizing cotton yield in Punjab and Sindh.', content: 'Cotton requires a well-planned fertilizer schedule. Apply DAP at sowing at 50 kg/acre. Top dress with urea at 30 and 60 days after germination. Potassium sulfate at boll formation stage improves fiber quality significantly.', category: 'Crop Guide', author: users[2]._id, tags: ['cotton','fertilizer','schedule'], isPublished: true, views: 289 },
    { title: 'Integrated Pest Management for Rice Crop', slug: 'rice-ipm-guide', excerpt: 'Sustainable pest management strategies for rice that reduce chemical input and improve long-term soil health.', content: 'IPM for rice involves monitoring, biological controls, and targeted chemical use. Use pheromone traps to monitor insect populations. Release Trichogramma cards for stem borer control. Use neonicotinoids only when pest threshold is exceeded.', category: 'IPM', author: users[2]._id, tags: ['rice','IPM','biological'], isPublished: true, views: 178 },
  ]);
  console.log('Blog posts created');

  // Coupons
  await Coupon.create([
    { code: 'WELCOME10', description: '10% off on first order', discountType: 'percentage', discountValue: 10, minOrderValue: 500, usageLimit: 1000, isActive: true },
    { code: 'SAVE200', description: 'PKR 200 off on orders above 2000', discountType: 'fixed', discountValue: 200, minOrderValue: 2000, usageLimit: 500, isActive: true },
    { code: 'KHARIF25', description: '25% off on Kharif season', discountType: 'percentage', discountValue: 25, minOrderValue: 1000, maxDiscount: 500, usageLimit: 200, isActive: true },
  ]);
  console.log('Coupons created');

  await CmsPage.create([
    { slug: 'homepage', title: 'Homepage', isPublished: true, meta: { heroTitle: 'Quality Products, Trusted Service', heroSubtitle: 'Shop premium products from Zia Traders & Co. — your reliable e-commerce partner.', promoText: '🎉 Free shipping on orders over PKR 2,000!' } },
    { slug: 'about', title: 'About Zia Traders & Co.', excerpt: 'Your trusted partner for quality products and reliable service.', content: 'Zia Traders & Co. has been serving customers across Pakistan with quality products and exceptional service for over 15 years. We specialize in agricultural supplies, trading goods, and expert customer support through our dedicated agronomist team.', meta: { contactEmail: 'info@ziatraders.pk', contactPhone: '+92-300-0000000', address: 'Main Boulevard, Lahore, Pakistan', businessHours: 'Mon-Sat: 9AM - 6PM' } },
    { slug: 'shop-info', title: 'Shop Information', content: 'Visit our flagship store in Lahore for in-person product consultation and pickup services.', meta: { contactEmail: 'shop@ziatraders.pk', contactPhone: '+92-300-0000001', address: 'Shop #12, Main Market, Lahore', policies: 'Returns accepted within 7 days with original receipt. Exchange policy applies to unopened products.' } },
  ]);
  console.log('CMS pages created');

  console.log('\n✅ Seeding complete!');
  console.log('\n📧 Demo Accounts:');
  console.log('Admin:      admin@ziatraders.pk     / 123456');
  console.log('Seller:     seller@ziatraders.pk    / 123456');
  console.log('Agronomist: agronomist@ziatraders.pk/ 123456');
  console.log('Customer:   customer@ziatraders.pk  / 123456');

  mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
