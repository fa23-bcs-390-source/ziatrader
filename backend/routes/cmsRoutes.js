const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middleware/authMiddleware');
const { CmsPage } = require('../models/index');

// Admin - get all pages (must be before /:slug)
router.get('/admin/all', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const pages = await CmsPage.find().sort({ slug: 1 });
  res.json({ success: true, pages });
}));

// Public - get all published pages
router.get('/', asyncHandler(async (req, res) => {
  const pages = await CmsPage.find({ isPublished: true }).select('slug title excerpt meta updatedAt');
  res.json({ success: true, pages });
}));

// Public - get one page by slug
// ✅ FIXED: returns empty content instead of 404 when page not in DB
router.get('/:slug', asyncHandler(async (req, res) => {
  if (req.params.slug === 'admin') {
    return res.json({ success: true, page: null });
  }

  const page = await CmsPage.findOne({ slug: req.params.slug, isPublished: true });

  // ✅ Don't throw error — return null so frontend handles it gracefully
  res.json({ success: true, page: page || null });
}));

// Admin - create or update page
router.put('/:slug', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const page = await CmsPage.findOneAndUpdate(
    { slug: req.params.slug },
    { ...req.body, updatedBy: req.user.id },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ success: true, page });
}));

module.exports = router;