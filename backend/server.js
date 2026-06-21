const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ─── ALLOWED ORIGINS ───────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://ziatraders-swo3.onrender.com',
  'https://ziatradersandco-i0rt.onrender.com',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io available in routes
app.set('io', io);

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── ROUTES ────────────────────────────────────────────────────────────────────
const authRoutes          = require('./routes/authRoutes');
const userRoutes          = require('./routes/userRoutes');
const sellerRoutes        = require('./routes/sellerRoutes');
const productRoutes       = require('./routes/productRoutes');
const categoryRoutes      = require('./routes/categoryRoutes');
const cartRoutes          = require('./routes/cartRoutes');
const orderRoutes         = require('./routes/orderRoutes');
const reviewRoutes        = require('./routes/reviewRoutes');
const paymentRoutes       = require('./routes/paymentRoutes');
const adminRoutes         = require('./routes/adminRoutes');
const notificationRoutes  = require('./routes/notificationRoutes');
const chatRoutes          = require('./routes/chatRoutes');
const agronomistRoutes    = require('./routes/agronomistRoutes');
const prescriptionRoutes  = require('./routes/prescriptionRoutes');
const couponRoutes        = require('./routes/couponRoutes');
const blogRoutes          = require('./routes/blogRoutes');
const cmsRoutes           = require('./routes/cmsRoutes');
const queryRoutes         = require('./routes/queryRoutes');
const analyticsRoutes     = require('./routes/analyticsRoutes');
const invoiceRoutes       = require('./routes/invoiceRoutes');
const warehouseRoutes     = require('./routes/warehouseRoutes');
const staffRoutes         = require('./routes/staffRoutes');
const expenseRoutes       = require('./routes/expenseRoutes');
const financeRoutes       = require('./routes/financeRoutes');
const logisticsRoutes     = require('./routes/logisticsRoutes');
const inventoryRoutes     = require('./routes/inventoryRoutes');

app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/sellers',       sellerRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/cart',          cartRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat',          chatRoutes);
app.use('/api/agronomist',    agronomistRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/coupons',       couponRoutes);
app.use('/api/blog',          blogRoutes);
app.use('/api/cms',           cmsRoutes);
app.use('/api/queries',       queryRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/invoices',      invoiceRoutes);
app.use('/api/warehouses',    warehouseRoutes);
app.use('/api/staff',         staffRoutes);
app.use('/api/expenses',      expenseRoutes);
app.use('/api/finance',       financeRoutes);
app.use('/api/logistics',     logisticsRoutes);
app.use('/api/inventory',     inventoryRoutes);

// TEMPORARY SEED ROUTE - remove after use
app.get('/api/seed-admin', async (req, res) => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');

    // Delete old demo accounts if any
    await User.deleteMany({ email: { $in: [
      'admin@agromart.pk',
      'seller@agromart.pk',
      'customer@agromart.pk',
      'agronomist@agromart.pk',
      'admin@ziatraders.pk',
      'seller@ziatraders.pk',
    ]}});

    // Create fresh demo accounts
    await User.create([
      { name: 'Super Admin',     email: 'admin@ziatraders.pk',      password: '123456', role: 'admin',      isEmailVerified: true },
      { name: 'Demo Seller',     email: 'seller@ziatraders.pk',     password: '123456', role: 'seller',     isEmailVerified: true },
      { name: 'Demo Customer',   email: 'customer@ziatraders.pk',   password: '123456', role: 'customer',   isEmailVerified: true },
      { name: 'Dr. Agro Expert', email: 'agronomist@ziatraders.pk', password: '123456', role: 'agronomist', isEmailVerified: true },
    ]);

    res.json({
      success: true,
      message: '✅ Demo accounts created!',
      accounts: [
        { role: 'admin',      email: 'admin@ziatraders.pk',      password: '123456' },
        { role: 'seller',     email: 'seller@ziatraders.pk',     password: '123456' },
        { role: 'customer',   email: 'customer@ziatraders.pk',   password: '123456' },
        { role: 'agronomist', email: 'agronomist@ziatraders.pk', password: '123456' },
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// ─── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'Zia Traders & Co. API is running', timestamp: new Date() });
});

// ─── 404 HANDLER for unknown API routes ────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── SOCKET.IO EVENTS ──────────────────────────────────────────────────────────
const socketHandler = require('./utils/socketHandler');
socketHandler(io);

// ─── ERROR HANDLER ─────────────────────────────────────────────────────────────
const errorMiddleware = require('./middleware/errorMiddleware');
app.use(errorMiddleware);

// ─── DATABASE + SERVER START ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ziatraders';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = { app, server };