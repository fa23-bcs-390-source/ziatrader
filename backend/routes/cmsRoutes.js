const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middleware/authMiddleware');
const { CmsPage } = require('../models/index');

router.get('/admin/all', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const pages = await CmsPage.find().sort({ slug: 1 });
  res.json({ success: true, pages });
}));

router.get('/', asyncHandler(async (req, res) => {
  const pages = await CmsPage.find({ isPublished: true }).select('slug title excerpt meta updatedAt');
  res.json({ success: true, pages });
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  if (req.params.slug === 'admin') { res.status(404); throw new Error('Page not found'); }
  const page = await CmsPage.findOne({ slug: req.params.slug, isPublished: true });
  if (!page) { res.status(404); throw new Error('Page not found'); }
  res.json({ success: true, page });
}));

router.put('/:slug', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const page = await CmsPage.findOneAndUpdate(
    { slug: req.params.slug },
    { ...req.body, updatedBy: req.user.id },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ success: true, page });
}));

module.exports = router;
