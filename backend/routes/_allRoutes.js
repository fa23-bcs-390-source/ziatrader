// Shared stub route factory
const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middleware/authMiddleware');

// ─── USER ROUTES ───────────────────────────────────────────────────────────────
const userRouter = express.Router();
const User = require('../models/User');

userRouter.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'name price images');
  res.json({ success: true, user });
}));
userRouter.put('/profile', protect, asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { name, phone, avatar }, { new: true });
  res.json({ success: true, user });
}));
userRouter.post('/addresses', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  user.addresses.push(req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
}));
userRouter.delete('/addresses/:addrId', protect, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $pull: { addresses: { _id: req.params.addrId } } });
  res.json({ success: true, message: 'Address removed' });
}));
userRouter.post('/wishlist/:productId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const idx = user.wishlist.indexOf(req.params.productId);
  if (idx > -1) user.wishlist.splice(idx, 1); else user.wishlist.push(req.params.productId);
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
}));

module.exports.userRouter = userRouter;

// ─── SELLER ROUTES ─────────────────────────────────────────────────────────────
const sellerRouter = express.Router();
const { Shop } = require('../models/index');
const Product = require('../models/Product');

sellerRouter.post('/shop', protect, authorize('seller'), asyncHandler(async (req, res) => {
  const existing = await Shop.findOne({ owner: req.user.id });
  if (existing) { res.status(400); throw new Error('Shop already exists'); }
  const shop = await Shop.create({ ...req.body, owner: req.user.id });
  res.status(201).json({ success: true, shop });
}));
sellerRouter.get('/shop', protect, authorize('seller'), asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user.id });
  res.json({ success: true, shop });
}));
sellerRouter.get('/products', protect, authorize('seller', 'admin'), asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user.id }).populate('category', 'name');
  res.json({ success: true, products });
}));
sellerRouter.get('/orders', protect, authorize('seller'), asyncHandler(async (req, res) => {
  const { Order } = require('../models/index');
  const orders = await Order.find({ 'items.seller': req.user.id }).populate('user', 'name email');
  res.json({ success: true, orders });
}));

module.exports.sellerRouter = sellerRouter;

// ─── CATEGORY ROUTES ───────────────────────────────────────────────────────────
const categoryRouter = express.Router();
const { Category } = require('../models/index');

categoryRouter.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true, parent: null }).sort('sortOrder');
  res.json({ success: true, categories });
}));
categoryRouter.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
}));
categoryRouter.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, category });
}));
categoryRouter.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
}));

module.exports.categoryRouter = categoryRouter;

// ─── REVIEW ROUTES ─────────────────────────────────────────────────────────────
const reviewRouter = express.Router();
const { Review } = require('../models/index');

reviewRouter.get('/product/:productId', asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .populate('user', 'name avatar').sort({ createdAt: -1 });
  res.json({ success: true, reviews });
}));
reviewRouter.post('/', protect, asyncHandler(async (req, res) => {
  const review = await Review.create({ ...req.body, user: req.user.id });
  // Update product rating
  const reviews = await Review.find({ product: req.body.product });
  const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(req.body.product, { ratings: avg.toFixed(1), numReviews: reviews.length });
  res.status(201).json({ success: true, review });
}));
reviewRouter.delete('/:id', protect, asyncHandler(async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Review deleted' });
}));

module.exports.reviewRouter = reviewRouter;

// ─── CART ROUTES ───────────────────────────────────────────────────────────────
const cartRouter = express.Router();

cartRouter.get('/', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('cart.product', 'name price discountedPrice images stock');
  res.json({ success: true, cart: user.cart });
}));
cartRouter.post('/add', protect, asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const user = await User.findById(req.user.id);
  const idx = user.cart.findIndex(i => i.product.toString() === productId);
  if (idx > -1) user.cart[idx].quantity += quantity;
  else user.cart.push({ product: productId, quantity });
  await user.save();
  res.json({ success: true, cart: user.cart });
}));
cartRouter.put('/update/:productId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const idx = user.cart.findIndex(i => i.product.toString() === req.params.productId);
  if (idx > -1) user.cart[idx].quantity = req.body.quantity;
  await user.save();
  res.json({ success: true, cart: user.cart });
}));
cartRouter.delete('/remove/:productId', protect, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $pull: { cart: { product: req.params.productId } } });
  res.json({ success: true, message: 'Item removed from cart' });
}));
cartRouter.delete('/clear', protect, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $set: { cart: [] } });
  res.json({ success: true, message: 'Cart cleared' });
}));

module.exports.cartRouter = cartRouter;

// ─── PAYMENT ROUTES ────────────────────────────────────────────────────────────
const paymentRouter = express.Router();

paymentRouter.post('/initiate', protect, asyncHandler(async (req, res) => {
  // Mock payment - in production integrate Stripe/PayFast
  const { amount, method } = req.body;
  if (method === 'cod') {
    return res.json({ success: true, paymentStatus: 'pending', message: 'COD order confirmed' });
  }
  // Mock card payment success
  res.json({ success: true, paymentStatus: 'paid', transactionId: `TXN${Date.now()}`, amount });
}));

module.exports.paymentRouter = paymentRouter;

// ─── NOTIFICATION ROUTES ───────────────────────────────────────────────────────
const notifRouter = express.Router();
const { Notification } = require('../models/index');

notifRouter.get('/', protect, asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, notifications });
}));
notifRouter.put('/read-all', protect, asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user.id }, { isRead: true });
  res.json({ success: true, message: 'All notifications marked as read' });
}));
notifRouter.put('/:id/read', protect, asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
}));

module.exports.notifRouter = notifRouter;

// ─── CHAT ROUTES ───────────────────────────────────────────────────────────────
const chatRouter = express.Router();
const { Chat } = require('../models/index');

chatRouter.get('/my', protect, asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user.id })
    .populate('participants', 'name avatar role').sort({ lastActivity: -1 });
  res.json({ success: true, chats });
}));
chatRouter.post('/start', protect, asyncHandler(async (req, res) => {
  const { recipientId, type } = req.body;
  let chat = await Chat.findOne({ participants: { $all: [req.user.id, recipientId] } });
  if (!chat) chat = await Chat.create({ participants: [req.user.id, recipientId], type });
  await chat.populate('participants', 'name avatar role');
  res.json({ success: true, chat });
}));
chatRouter.get('/:chatId/messages', protect, asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId).populate('messages.sender', 'name avatar');
  if (!chat) { res.status(404); throw new Error('Chat not found'); }
  res.json({ success: true, messages: chat.messages });
}));

module.exports.chatRouter = chatRouter;

// ─── AGRONOMIST ROUTES ─────────────────────────────────────────────────────────
const agronomistRouter = express.Router();
const { Consultation } = require('../models/index');

agronomistRouter.get('/list', asyncHandler(async (req, res) => {
  const agronomists = await User.find({ role: 'agronomist', isActive: true }, 'name avatar phone');
  res.json({ success: true, agronomists });
}));
agronomistRouter.post('/consult', protect, asyncHandler(async (req, res) => {
  const consultation = await Consultation.create({ ...req.body, customer: req.user.id });
  res.status(201).json({ success: true, consultation });
}));
agronomistRouter.get('/consultations', protect, asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === 'agronomist') filter = { agronomist: req.user.id };
  else if (req.user.role === 'customer') filter = { customer: req.user.id };
  const consultations = await Consultation.find(filter)
    .populate('customer agronomist', 'name email avatar phone').sort({ scheduledAt: -1 });
  res.json({ success: true, consultations });
}));
agronomistRouter.put('/consultations/:id/status', protect, authorize('agronomist', 'admin'), asyncHandler(async (req, res) => {
  const { status, notes, scheduledAt, rescheduleReason } = req.body;
  const consultation = await Consultation.findById(req.params.id);
  if (!consultation) { res.status(404); throw new Error('Consultation not found'); }
  if (status) consultation.status = status;
  if (notes) consultation.notes = notes;
  if (scheduledAt) {
    consultation.rescheduledAt = new Date(scheduledAt);
    consultation.scheduledAt = new Date(scheduledAt);
    consultation.status = 'rescheduled';
    consultation.rescheduleReason = rescheduleReason || '';
  }
  await consultation.save();
  const { Notification } = require('../models/index');
  await Notification.create({
    user: consultation.customer,
    title: 'Appointment Updated',
    message: `Your appointment status is now: ${consultation.status}`,
    type: 'system',
    link: '/agronomist',
  });
  const populated = await Consultation.findById(consultation._id)
    .populate('customer agronomist', 'name email avatar phone');
  res.json({ success: true, consultation: populated });
}));
agronomistRouter.get('/appointments/all', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const consultations = await Consultation.find()
    .populate('customer agronomist', 'name email avatar phone').sort({ scheduledAt: -1 });
  res.json({ success: true, consultations });
}));

module.exports.agronomistRouter = agronomistRouter;

// ─── PRESCRIPTION ROUTES ───────────────────────────────────────────────────────
const prescriptionRouter = express.Router();
const { Prescription } = require('../models/index');

const DISEASE_MAP = {
  'yellowing': { disease: 'Nitrogen Deficiency', products: [] },
  'spots':     { disease: 'Fungal Leaf Spot',    products: [] },
  'wilting':   { disease: 'Root Rot',             products: [] },
  'insects':   { disease: 'Insect Infestation',   products: [] },
  'rust':      { disease: 'Wheat Rust',           products: [] },
};

prescriptionRouter.post('/', protect, asyncHandler(async (req, res) => {
  const { cropType, symptoms, uploadedImage } = req.body;
  const symptomLower = (symptoms || '').toLowerCase();
  let detected = 'Unknown Disease';
  for (const [key, val] of Object.entries(DISEASE_MAP)) {
    if (symptomLower.includes(key)) { detected = val.disease; break; }
  }
  const prescription = await Prescription.create({
    user: req.user.id, cropType, symptoms, uploadedImage,
    detectedDisease: detected, status: 'analysed',
  });
  res.status(201).json({ success: true, prescription });
}));
prescriptionRouter.get('/my', protect, asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, prescriptions });
}));

module.exports.prescriptionRouter = prescriptionRouter;

// ─── COUPON ROUTES ─────────────────────────────────────────────────────────────
const couponRouter = express.Router();
const { Coupon } = require('../models/index');

couponRouter.post('/validate', protect, asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) { res.status(404); throw new Error('Invalid coupon code'); }
  if (coupon.expiryDate && new Date() > coupon.expiryDate) { res.status(400); throw new Error('Coupon expired'); }
  if (orderTotal < coupon.minOrderValue) { res.status(400); throw new Error(`Minimum order value is PKR ${coupon.minOrderValue}`); }
  if (coupon.usageCount >= coupon.usageLimit) { res.status(400); throw new Error('Coupon usage limit reached'); }
  let discount = coupon.discountType === 'percentage' ? (orderTotal * coupon.discountValue) / 100 : coupon.discountValue;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  res.json({ success: true, coupon, discount });
}));
couponRouter.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
}));
couponRouter.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
}));
couponRouter.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
}));

module.exports.couponRouter = couponRouter;

// ─── BLOG ROUTES ───────────────────────────────────────────────────────────────
const blogRouter = express.Router();
const { Blog } = require('../models/index');

blogRouter.get('/', asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ isPublished: true }).populate('author', 'name avatar').sort({ createdAt: -1 });
  res.json({ success: true, blogs });
}));
blogRouter.get('/:slug', asyncHandler(async (req, res) => {
  const blog = await Blog.findOneAndUpdate({ slug: req.params.slug }, { $inc: { views: 1 } }, { new: true })
    .populate('author', 'name avatar');
  if (!blog) { res.status(404); throw new Error('Blog not found'); }
  res.json({ success: true, blog });
}));
blogRouter.post('/', protect, authorize('admin', 'agronomist'), asyncHandler(async (req, res) => {
  const blog = await Blog.create({ ...req.body, author: req.user.id });
  res.status(201).json({ success: true, blog });
}));

module.exports.blogRouter = blogRouter;

// ─── ANALYTICS ROUTES ──────────────────────────────────────────────────────────
const analyticsRouter = express.Router();
const { Order } = require('../models/index');

analyticsRouter.get('/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const [totalUsers, totalOrders, totalProducts, revenueData, lowStock] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments(),
    Order.aggregate([
      { $match: { orderStatus: { $nin: ['cancelled', 'returned'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Product.find({ stock: { $lte: 10 }, isActive: true }).select('name stock stockStatus').limit(10),
  ]);
  const revenue = revenueData[0]?.total || 0;

  const monthlySales = await Order.aggregate([
    { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  const recentOrders = await Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(5);

  res.json({ success: true, stats: { totalUsers, totalOrders, totalProducts, revenue }, monthlySales, lowStock, recentOrders });
}));

analyticsRouter.get('/seller', protect, authorize('seller'), asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user.id }).sort({ salesCount: -1 }).limit(5);
  const totalProducts = await Product.countDocuments({ seller: req.user.id });
  res.json({ success: true, topProducts: products, totalProducts });
}));

module.exports.analyticsRouter = analyticsRouter;

// ─── INVOICE ROUTES ────────────────────────────────────────────────────────────
const invoiceRouter = express.Router();

invoiceRouter.get('/:orderId', protect, asyncHandler(async (req, res) => {
  const { Order } = require('../models/index');
  const order = await Order.findById(req.params.orderId)
    .populate('user', 'name email')
    .populate('items.product', 'name');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  // Return invoice data as JSON (PDF generation can be added with pdfkit)
  res.json({
    success: true,
    invoice: {
      invoiceNo: `INV-${order._id.toString().slice(-6).toUpperCase()}`,
      date: order.createdAt,
      customer: order.user,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      shippingCost: order.shippingCost,
      total: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    },
  });
}));

module.exports.invoiceRouter = invoiceRouter;

// ─── ADMIN ROUTES ──────────────────────────────────────────────────────────────
const adminRouter = express.Router();

adminRouter.get('/users', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { search, role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users });
}));
adminRouter.post('/users', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const exists = await User.findOne({ email });
  if (exists) { res.status(400); throw new Error('Email already registered'); }
  const user = await User.create({ name, email, password, role: role || 'customer', phone });
  res.status(201).json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive } });
}));
adminRouter.put('/users/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { name, email, role, phone, isActive } = req.body;
  const update = { name, email, role, phone };
  if (typeof isActive === 'boolean') update.isActive = isActive;
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, user });
}));
adminRouter.delete('/users/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role === 'admin') { res.status(400); throw new Error('Cannot delete admin account'); }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
}));
adminRouter.put('/users/:id/toggle', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, user });
}));
adminRouter.get('/orders', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, orders });
}));
adminRouter.put('/products/:id/approve', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  res.json({ success: true, product });
}));
adminRouter.get('/products', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { search, category, status } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;
  if (status === 'pending') filter.isApproved = false;
  if (search) filter.name = { $regex: search, $options: 'i' };
  const products = await Product.find(filter).populate('category', 'name').sort({ createdAt: -1 });
  res.json({ success: true, products });
}));
adminRouter.get('/shops', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { Shop } = require('../models/index');
  const shops = await Shop.find().populate('owner', 'name email');
  res.json({ success: true, shops });
}));
adminRouter.put('/shops/:id/approve', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { Shop } = require('../models/index');
  const shop = await Shop.findByIdAndUpdate(req.params.id, { isApproved: true, isVerified: true }, { new: true });
  res.json({ success: true, shop });
}));

module.exports.adminRouter = adminRouter;

// ─── WAREHOUSE ROUTES ──────────────────────────────────────────────────────────
const warehouseRouter = express.Router();
const { Warehouse } = require('../models/index');

warehouseRouter.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const warehouses = await Warehouse.find().sort({ createdAt: -1 });
  res.json({ success: true, warehouses });
}));
warehouseRouter.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.create(req.body);
  res.status(201).json({ success: true, warehouse });
}));
warehouseRouter.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!warehouse) { res.status(404); throw new Error('Warehouse not found'); }
  res.json({ success: true, warehouse });
}));
warehouseRouter.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
  if (!warehouse) { res.status(404); throw new Error('Warehouse not found'); }
  res.json({ success: true, message: 'Warehouse deleted' });
}));

module.exports.warehouseRouter = warehouseRouter;

// ─── STAFF ROUTES ──────────────────────────────────────────────────────────────
const staffRouter = express.Router();
const { Staff } = require('../models/index');

staffRouter.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const staff = await Staff.find().populate('warehouse', 'name code').sort({ createdAt: -1 });
  res.json({ success: true, staff });
}));
staffRouter.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const staffMember = await Staff.create(req.body);
  res.status(201).json({ success: true, staff: staffMember });
}));
staffRouter.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const staffMember = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('warehouse', 'name code');
  if (!staffMember) { res.status(404); throw new Error('Staff not found'); }
  res.json({ success: true, staff: staffMember });
}));
staffRouter.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const staffMember = await Staff.findByIdAndDelete(req.params.id);
  if (!staffMember) { res.status(404); throw new Error('Staff not found'); }
  res.json({ success: true, message: 'Staff deleted' });
}));

module.exports.staffRouter = staffRouter;

// ─── EXPENSE ROUTES ────────────────────────────────────────────────────────────
const expenseRouter = express.Router();
const { Expense } = require('../models/index');
const normalizeAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return amount;
};

expenseRouter.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const expenses = await Expense.find()
    .populate('warehouse', 'name code')
    .populate('staff', 'name')
    .populate('createdBy', 'name email')
    .sort({ date: -1 });
  res.json({ success: true, expenses });
}));
expenseRouter.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const amount = normalizeAmount(req.body.amount);
  if (!req.body.category || amount === null) { res.status(400); throw new Error('Valid category and amount are required'); }

  const expense = await Expense.create({ ...req.body, amount, createdBy: req.user.id });
  await FinanceTxn.create({
    type: 'expense',
    category: expense.category,
    description: expense.description || 'Auto ledger entry from expense module',
    amount: expense.amount,
    date: expense.date || new Date(),
    expense: expense._id,
    createdBy: req.user.id,
  });
  res.status(201).json({ success: true, expense });
}));
expenseRouter.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.amount !== undefined) {
    const amount = normalizeAmount(payload.amount);
    if (amount === null) { res.status(400); throw new Error('Amount must be a valid non-negative number'); }
    payload.amount = amount;
  }

  const expense = await Expense.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
    .populate('warehouse', 'name code')
    .populate('staff', 'name')
    .populate('createdBy', 'name email');
  if (!expense) { res.status(404); throw new Error('Expense not found'); }

  const existingTxn = await FinanceTxn.findOne({ expense: expense._id });
  if (existingTxn) {
    existingTxn.type = 'expense';
    existingTxn.category = expense.category;
    existingTxn.description = expense.description || 'Auto ledger entry from expense module';
    existingTxn.amount = expense.amount;
    existingTxn.date = expense.date || existingTxn.date;
    await existingTxn.save();
  } else {
    await FinanceTxn.create({
      type: 'expense',
      category: expense.category,
      description: expense.description || 'Auto ledger entry from expense module',
      amount: expense.amount,
      date: expense.date || new Date(),
      expense: expense._id,
      createdBy: req.user.id,
    });
  }

  res.json({ success: true, expense });
}));
expenseRouter.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) { res.status(404); throw new Error('Expense not found'); }
  await FinanceTxn.deleteMany({ expense: expense._id });
  res.json({ success: true, message: 'Expense deleted' });
}));

module.exports.expenseRouter = expenseRouter;

// ─── FINANCE ROUTES ────────────────────────────────────────────────────────────
const financeRouter = express.Router();
const { FinanceTxn } = require('../models/index');

financeRouter.get('/summary', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const [incomeAgg, expenseAgg] = await Promise.all([
    FinanceTxn.aggregate([{ $match: { type: 'income' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    FinanceTxn.aggregate([{ $match: { type: 'expense' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);
  const totalIncome = incomeAgg[0]?.total || 0;
  const totalExpense = expenseAgg[0]?.total || 0;
  res.json({ success: true, summary: { totalIncome, totalExpense, profit: totalIncome - totalExpense } });
}));
financeRouter.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const txns = await FinanceTxn.find()
    .populate('order', '_id totalAmount paymentStatus')
    .populate('expense', 'category amount')
    .populate('createdBy', 'name email')
    .sort({ date: -1, createdAt: -1 });
  res.json({ success: true, transactions: txns });
}));
financeRouter.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const amount = normalizeAmount(req.body.amount);
  if (!['income', 'expense'].includes(req.body.type) || !req.body.category || amount === null) {
    res.status(400);
    throw new Error('Valid type, category and amount are required');
  }
  const txn = await FinanceTxn.create({ ...req.body, amount, createdBy: req.user.id });
  res.status(201).json({ success: true, transaction: txn });
}));
financeRouter.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.amount !== undefined) {
    const amount = normalizeAmount(payload.amount);
    if (amount === null) { res.status(400); throw new Error('Amount must be a valid non-negative number'); }
    payload.amount = amount;
  }
  const txn = await FinanceTxn.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
    .populate('order', '_id totalAmount paymentStatus')
    .populate('expense', 'category amount')
    .populate('createdBy', 'name email');
  if (!txn) { res.status(404); throw new Error('Transaction not found'); }
  res.json({ success: true, transaction: txn });
}));
financeRouter.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const txn = await FinanceTxn.findByIdAndDelete(req.params.id);
  if (!txn) { res.status(404); throw new Error('Transaction not found'); }
  res.json({ success: true, message: 'Transaction deleted' });
}));

module.exports.financeRouter = financeRouter;

// ─── LOGISTICS ROUTES ──────────────────────────────────────────────────────────
const logisticsRouter = express.Router();
const { Shipment } = require('../models/index');

logisticsRouter.get('/', protect, authorize('admin', 'seller'), asyncHandler(async (req, res) => {
  const { Order } = require('../models/index');
  const match = {};
  // Sellers can only see shipments for orders containing their items.
  if (req.user.role === 'seller') {
    const orderIds = await Order.distinct('_id', { 'items.seller': req.user.id });
    match.order = { $in: orderIds };
  }
  const shipments = await Shipment.find(match)
    .populate('order', '_id orderStatus paymentStatus totalAmount')
    .populate('fromWarehouse', 'name code')
    .sort({ createdAt: -1 });
  res.json({ success: true, shipments });
}));
logisticsRouter.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const shipment = await Shipment.create({
    ...req.body,
    statusHistory: [{ status: req.body.status || 'created', note: 'Created' }],
  });
  res.status(201).json({ success: true, shipment });
}));
logisticsRouter.put('/:id/status', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) { res.status(404); throw new Error('Shipment not found'); }
  shipment.status = status || shipment.status;
  shipment.statusHistory.push({ status: shipment.status, note: note || '' });
  if (shipment.status === 'in_transit' && !shipment.shippedAt) shipment.shippedAt = new Date();
  if (shipment.status === 'delivered') shipment.deliveredAt = new Date();
  await shipment.save();
  res.json({ success: true, shipment });
}));
logisticsRouter.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const shipment = await Shipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!shipment) { res.status(404); throw new Error('Shipment not found'); }
  res.json({ success: true, shipment });
}));
logisticsRouter.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const shipment = await Shipment.findByIdAndDelete(req.params.id);
  if (!shipment) { res.status(404); throw new Error('Shipment not found'); }
  res.json({ success: true, message: 'Shipment deleted' });
}));

module.exports.logisticsRouter = logisticsRouter;

// ─── INVENTORY ROUTES ──────────────────────────────────────────────────────────
const inventoryRouter = express.Router();
const { InventoryLog } = require('../models/index');

inventoryRouter.get('/summary', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const lowStockThreshold = Number(req.query.lowStockThreshold || 10);
  const products = await Product.find({}, 'name stock category').populate('category', 'name');
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockItems = products.filter((p) => (p.stock || 0) <= lowStockThreshold);

  res.json({
    success: true,
    summary: {
      totalProducts,
      totalStockUnits,
      lowStockThreshold,
      lowStockCount: lowStockItems.length,
    },
    lowStockItems,
  });
}));

inventoryRouter.get('/logs', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const logs = await InventoryLog.find()
    .populate('product', 'name stock')
    .populate('warehouse', 'name code')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(200);
  res.json({ success: true, logs });
}));
inventoryRouter.post('/adjust', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { productId, warehouseId, delta, reason, note } = req.body;
  if (!productId || typeof delta !== 'number') { res.status(400); throw new Error('productId and numeric delta are required'); }
  if (delta === 0) { res.status(400); throw new Error('delta cannot be zero'); }
  const product = await Product.findById(productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  const nextStock = (product.stock || 0) + delta;
  if (nextStock < 0) { res.status(400); throw new Error('Insufficient stock for this adjustment'); }
  product.stock = nextStock;
  await product.save();
  const log = await InventoryLog.create({
    product: productId,
    warehouse: warehouseId || undefined,
    delta,
    reason: reason || 'manual',
    note,
    createdBy: req.user.id,
  });
  res.status(201).json({ success: true, product, log });
}));

module.exports.inventoryRouter = inventoryRouter;
