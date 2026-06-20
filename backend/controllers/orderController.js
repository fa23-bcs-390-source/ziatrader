// controllers/orderController.js
const asyncHandler = require('express-async-handler');
const { Order } = require('../models/index');
const Product = require('../models/Product');
const User = require('../models/User');
const { Notification } = require('../models/index');

exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, coupon, subtotal, discount, shippingCost, tax, totalAmount } = req.body;

  // Validate stock
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.quantity) {
      res.status(400); throw new Error(`Insufficient stock for ${item.name}`);
    }
  }

  const order = await Order.create({
    user: req.user.id, items, shippingAddress, paymentMethod,
    coupon, subtotal, discount, shippingCost, tax: tax || 0, totalAmount,
    statusHistory: [{ status: 'placed', note: 'Order placed successfully' }],
  });

  // Reduce stock
  for (const item of items) {
    const product = await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, salesCount: item.quantity },
    }, { new: true });
    if (product) {
      let stockStatus = 'in_stock';
      if (product.stock <= 0) stockStatus = 'out_of_stock';
      else if (product.stock <= 10) stockStatus = 'low_stock';
      await Product.findByIdAndUpdate(item.product, { stockStatus });
    }
  }

  // Clear cart after successful order
  await User.findByIdAndUpdate(req.user.id, { $set: { cart: [] } });

  // Notify user
  await Notification.create({
    user: req.user.id,
    title: 'Order Placed!',
    message: `Your order #${order._id} has been placed successfully.`,
    type: 'order',
    link: `/orders/${order._id}`,
  });

  const populated = await Order.findById(order._id).populate('items.product', 'name images');
  res.status(201).json({ success: true, order: populated });
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name images');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  res.json({ success: true, order });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  order.orderStatus = status;
  order.statusHistory.push({ status, note });
  await order.save();

  await Notification.create({
    user: order.user,
    title: `Order ${status}`,
    message: `Your order #${order._id} status updated to ${status}.`,
    type: 'order',
    link: `/orders/${order._id}`,
  });
  res.json({ success: true, order });
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (!['placed', 'confirmed'].includes(order.orderStatus)) {
    res.status(400); throw new Error('Order cannot be cancelled at this stage');
  }
  order.orderStatus = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled by customer' });
  await order.save();
  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, salesCount: -item.quantity } });
  }
  res.json({ success: true, order });
});
