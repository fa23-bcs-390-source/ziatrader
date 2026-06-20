const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: String,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, default: 'bottle' },
    expiryDate: { type: Date },
    brand: String,
    sku: { type: String, unique: true, sparse: true, trim: true, uppercase: true },
    specifications: [{ key: String, value: String }],
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock',
    },
    cropTypes: [String],
    diseases: [String],           // e.g., ['aphids', 'rust', 'blight']
    activeIngredients: [String],
    dosage: String,
    safetyInstructions: String,
    legalDisclaimer: String,
    weight: Number,
    tags: [String],
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    salesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

productSchema.pre('save', function (next) {
  if (this.stock <= 0) this.stockStatus = 'out_of_stock';
  else if (this.stock <= 10) this.stockStatus = 'low_stock';
  else this.stockStatus = 'in_stock';
  next();
});

module.exports = mongoose.model('Product', productSchema);
