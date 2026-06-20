const mongoose = require('mongoose');

// ─── ORDER MODEL ───────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        image: String,
        price: Number,
        quantity: Number,
        seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zip: String,
      phone: String,
    },
    paymentMethod: { type: String, enum: ['cod', 'card', 'online'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'placed',
    },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    subtotal: Number,
    discount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: Number,
    trackingNumber: String,
    notes: String,
    invoiceUrl: String,
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

// ─── SHOP MODEL ────────────────────────────────────────────────────────────────
const shopSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: String,
    logo: String,
    banner: String,
    location: {
      city: String,
      state: String,
      coordinates: { lat: Number, lng: Number },
    },
    phone: String,
    email: String,
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── CATEGORY MODEL ────────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── REVIEW MODEL ──────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    images: [String],
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── CHAT MODEL ────────────────────────────────────────────────────────────────
const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    type: { type: String, enum: ['customer-seller', 'customer-agronomist'], default: 'customer-seller' },
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: String,
        type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
        isRead: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    lastMessage: String,
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ─── NOTIFICATION MODEL ────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: String,
    message: String,
    type: {
      type: String,
      enum: ['order', 'stock', 'prescription', 'chat', 'system', 'promo'],
      default: 'system',
    },
    link: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── BLOG MODEL ────────────────────────────────────────────────────────────────
const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: String,
    excerpt: String,
    image: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: String,
    tags: [String],
    isPublished: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── COUPON MODEL ──────────────────────────────────────────────────────────────
const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: String,
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: { type: Number, default: 100 },
    usageCount: { type: Number, default: 0 },
    expiryDate: Date,
    isActive: { type: Boolean, default: true },
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

// ─── PRESCRIPTION MODEL ────────────────────────────────────────────────────────
const prescriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cropType: String,
    symptoms: String,
    uploadedImage: String,
    detectedDisease: String,
    recommendedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    agronomistNotes: String,
    pdfUrl: String,
    status: { type: String, enum: ['pending', 'analysed', 'completed'], default: 'pending' },
  },
  { timestamps: true }
);

// ─── CONSULTATION MODEL ────────────────────────────────────────────────────────
const consultationSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agronomist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: Date,
    status: { type: String, enum: ['requested', 'confirmed', 'rescheduled', 'completed', 'cancelled'], default: 'requested' },
    notes: String,
    adminNotes: String,
    cropType: String,
    issue: String,
    fee: { type: Number, default: 0 },
    rescheduledAt: Date,
    rescheduleReason: String,
  },
  { timestamps: true }
);

// ─── QUERY MODEL ───────────────────────────────────────────────────────────────
const querySchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agronomist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    response: String,
    status: { type: String, enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { timestamps: true }
);

// ─── CMS PAGE MODEL ────────────────────────────────────────────────────────────
const cmsPageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    excerpt: String,
    images: [String],
    meta: {
      contactEmail: String,
      contactPhone: String,
      address: String,
      businessHours: String,
      policies: String,
      heroTitle: String,
      heroSubtitle: String,
      heroImage: String,
      promoText: String,
      promoLink: String,
    },
    isPublished: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ─── WAREHOUSE MODEL ───────────────────────────────────────────────────────────
const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    address: String,
    city: String,
    state: String,
    capacityNotes: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── STAFF MODEL ───────────────────────────────────────────────────────────────
const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: String,
    department: { type: String, default: 'operations' },
    position: { type: String, default: 'staff' },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    salary: { type: Number, default: 0, min: 0 },
    joinDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── EXPENSE MODEL ─────────────────────────────────────────────────────────────
const expenseSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    category: { type: String, required: true, trim: true }, // e.g. Rent, Fuel, Salaries
    description: String,
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'bank', 'card', 'other'], default: 'cash' },
    referenceNo: String,
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ─── FINANCE TRANSACTION MODEL ────────────────────────────────────────────────
const financeTxnSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true, trim: true },
    description: String,
    amount: { type: Number, required: true, min: 0 },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    expense: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ─── LOGISTICS SHIPMENT MODEL ─────────────────────────────────────────────────
const shipmentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    trackingNumber: { type: String, trim: true },
    carrier: { type: String, trim: true }, // e.g. TCS, Leopards, By-Hand
    status: {
      type: String,
      enum: ['created', 'picked', 'in_transit', 'delivered', 'cancelled', 'returned'],
      default: 'created',
    },
    fromWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    toAddress: {
      street: String,
      city: String,
      state: String,
      zip: String,
      phone: String,
    },
    shippedAt: Date,
    deliveredAt: Date,
    notes: String,
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

// ─── INVENTORY LOG MODEL ──────────────────────────────────────────────────────
const inventoryLogSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    type: { type: String, enum: ['adjustment', 'in', 'out'], default: 'adjustment' },
    delta: { type: Number, required: true }, // +5 / -2
    reason: { type: String, default: 'manual' },
    note: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = {
  Order:        mongoose.model('Order', orderSchema),
  Shop:         mongoose.model('Shop', shopSchema),
  Category:     mongoose.model('Category', categorySchema),
  Review:       mongoose.model('Review', reviewSchema),
  Chat:         mongoose.model('Chat', chatSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  Blog:         mongoose.model('Blog', blogSchema),
  Coupon:       mongoose.model('Coupon', couponSchema),
  Prescription: mongoose.model('Prescription', prescriptionSchema),
  Consultation: mongoose.model('Consultation', consultationSchema),
  Query:        mongoose.model('Query', querySchema),
  CmsPage:      mongoose.model('CmsPage', cmsPageSchema),
  Warehouse:    mongoose.model('Warehouse', warehouseSchema),
  Staff:        mongoose.model('Staff', staffSchema),
  Expense:      mongoose.model('Expense', expenseSchema),
  FinanceTxn:   mongoose.model('FinanceTxn', financeTxnSchema),
  Shipment:     mongoose.model('Shipment', shipmentSchema),
  InventoryLog: mongoose.model('InventoryLog', inventoryLogSchema),
};
