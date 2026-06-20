// controllers/productController.js
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

const populateFields = 'category seller shop';
const categoryPopulate = { path: 'category', select: 'name slug' };

// @GET /api/products
exports.getProducts = asyncHandler(async (req, res) => {
  const { search, category, cropType, disease, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
  const query = { isActive: true, isApproved: true };

  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (cropType) query.cropTypes = { $in: [cropType] };
  if (disease) query.diseases = { $in: [disease] };
  if (minPrice || maxPrice) query.price = {};
  if (minPrice) query.price.$gte = Number(minPrice);
  if (maxPrice) query.price.$lte = Number(maxPrice);

  const sortOptions = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { ratings: -1 },
    popular: { salesCount: -1 },
  };
  const sortBy = sortOptions[sort] || { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(query).populate(categoryPopulate).populate('seller', 'name').sort(sortBy).skip(skip).limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.json({ success: true, products, total, pages: Math.ceil(total / Number(limit)), page: Number(page) });
});

// @GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('seller', 'name avatar');
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true,
    isApproved: true,
  }).limit(4).populate('category', 'name');

  res.json({ success: true, product, related });
});

// @POST /api/products
exports.createProduct = asyncHandler(async (req, res) => {
  req.body.seller = req.user.id;
  if (req.user.role === 'admin') {
    req.body.isApproved = true;
  }
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @PUT /api/products/:id
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, product });
});

// @DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product removed' });
});

// @GET /api/products/featured
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true, isApproved: true })
    .populate('category', 'name')
    .limit(8);
  res.json({ success: true, products });
});

// @GET /api/products/latest
exports.getLatestProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isApproved: true })
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(8);
  res.json({ success: true, products });
});

// @GET /api/products/bestsellers
exports.getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isApproved: true })
    .populate('category', 'name')
    .sort({ salesCount: -1 })
    .limit(8);
  res.json({ success: true, products });
});
