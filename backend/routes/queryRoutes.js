const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middleware/authMiddleware');
const { Query, Notification } = require('../models/index');
const User = require('../models/User');

router.post('/', protect, asyncHandler(async (req, res) => {
  const query = await Query.create({ ...req.body, customer: req.user.id });
  const populated = await Query.findById(query._id).populate('customer', 'name email');
  res.status(201).json({ success: true, query: populated });
}));

router.get('/my', protect, asyncHandler(async (req, res) => {
  const filter = req.user.role === 'agronomist'
    ? { $or: [{ agronomist: req.user.id }, { agronomist: null, status: { $in: ['open', 'assigned'] } }] }
    : req.user.role === 'admin'
    ? {}
    : { customer: req.user.id };
  const queries = await Query.find(filter)
    .populate('customer agronomist', 'name email avatar')
    .sort({ createdAt: -1 });
  res.json({ success: true, queries });
}));

router.put('/:id/respond', protect, authorize('agronomist', 'admin'), asyncHandler(async (req, res) => {
  const { response, status } = req.body;
  const query = await Query.findById(req.params.id);
  if (!query) { res.status(404); throw new Error('Query not found'); }
  if (response) query.response = response;
  if (status) query.status = status;
  if (!query.agronomist) query.agronomist = req.user.id;
  if (query.status === 'open') query.status = 'in_progress';
  await query.save();
  await Notification.create({
    user: query.customer,
    title: 'Query Update',
    message: 'Your support query has been updated.',
    type: 'system',
    link: '/queries',
  });
  const populated = await Query.findById(query._id).populate('customer agronomist', 'name email avatar');
  res.json({ success: true, query: populated });
}));

router.put('/:id/assign', protect, authorize('admin', 'agronomist'), asyncHandler(async (req, res) => {
  const query = await Query.findByIdAndUpdate(
    req.params.id,
    { agronomist: req.body.agronomistId || req.user.id, status: 'assigned' },
    { new: true }
  ).populate('customer agronomist', 'name email avatar');
  if (!query) { res.status(404); throw new Error('Query not found'); }
  res.json({ success: true, query });
}));

router.put('/:id/status', protect, authorize('agronomist', 'admin'), asyncHandler(async (req, res) => {
  const query = await Query.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    .populate('customer agronomist', 'name email avatar');
  if (!query) { res.status(404); throw new Error('Query not found'); }
  res.json({ success: true, query });
}));

router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  await Query.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Query deleted' });
}));

module.exports = router;
