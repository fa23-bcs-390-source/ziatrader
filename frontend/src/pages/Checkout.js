import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, couponAPI, paymentAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [payMethod, setPayMethod] = useState('cod');
  const [addr, setAddr] = useState({ street:'', city:'', state:'', zip:'', phone:'' });

  const shipping = cartTotal >= 2000 ? 0 : 150;
  const tax = Math.round(cartTotal * 0.05);
  const discount = couponData?.discount || 0;
  const total = cartTotal + shipping + tax - discount;

  const applyCoupon = async () => {
    try {
      const { data } = await couponAPI.validate(couponCode, cartTotal);
      setCouponData(data);
      toast.success(`Coupon applied! You save PKR ${data.discount}`);
    } catch(e) { toast.error(e.response?.data?.message || 'Invalid coupon'); }
  };

  const placeOrder = async () => {
    if (!addr.street || !addr.city || !addr.phone) { toast.error('Please fill all address fields'); return; }
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        product: i.product._id, name: i.product.name,
        image: i.product.images?.[0], price: i.product.discountedPrice || i.product.price,
        quantity: i.quantity, seller: i.product.seller,
      }));
      const { data } = await orderAPI.create({
        items: orderItems, shippingAddress: addr, paymentMethod: payMethod,
        coupon: couponData?.coupon?._id, subtotal: cartTotal,
        discount, shippingCost: shipping, tax, totalAmount: total,
      });
      if (payMethod !== 'cod') await paymentAPI.initiate({ amount: total, method: payMethod });
      await clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${data.order._id}`);
    } catch(e) { toast.error(e.response?.data?.message || 'Failed to place order'); }
    finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        <div>
          <div className="card p-4 mb-3">
            <h3 style={{ marginBottom: '1.25rem' }}>📍 Delivery Address</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Street / Area</label>
                <input className="form-control" placeholder="House #, Street, Area" value={addr.street} onChange={e=>setAddr({...addr,street:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-control" placeholder="Lahore" value={addr.city} onChange={e=>setAddr({...addr,city:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Province</label>
                <input className="form-control" placeholder="Punjab" value={addr.state} onChange={e=>setAddr({...addr,state:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-control" placeholder="03XX-XXXXXXX" value={addr.phone} onChange={e=>setAddr({...addr,phone:e.target.value})} />
              </div>
            </div>
          </div>

          <div className="card p-4 mb-3">
            <h3 style={{ marginBottom: '1.25rem' }}>💳 Payment Method</h3>
            {['cod','card','online'].map(m => (
              <label key={m} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.85rem 1rem', border:`2px solid ${payMethod===m?'var(--green-600)':'var(--gray-200)'}`, borderRadius:12, marginBottom:'0.75rem', cursor:'pointer', background:payMethod===m?'var(--green-50)':'white', transition:'all 0.2s' }}>
                <input type="radio" name="pay" checked={payMethod===m} onChange={()=>setPayMethod(m)} />
                <span style={{ fontSize:'1.2rem' }}>{m==='cod'?'💵':m==='card'?'💳':'📱'}</span>
                <div>
                  <strong style={{ fontSize:'0.9rem' }}>{m==='cod'?'Cash on Delivery':m==='card'?'Credit / Debit Card':'Online Banking'}</strong>
                  <p style={{ fontSize:'0.75rem', color:'var(--gray-500)', marginTop:'0.1rem' }}>
                    {m==='cod'?'Pay when your order arrives':'Secure mock payment for demo'}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <div className="card p-4">
            <h3 style={{ marginBottom: '1rem' }}>🎟 Coupon Code</h3>
            <div className="flex gap-1">
              <input className="form-control" placeholder="Enter coupon code" value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())} />
              <button className="btn btn-secondary" onClick={applyCoupon}>Apply</button>
            </div>
            {couponData && <div className="alert alert-success mt-2">✅ Coupon applied! Saving PKR {couponData.discount}</div>}
          </div>
        </div>

        <div className="card p-3" style={{ position: 'sticky', top: 90 }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Order Summary</h3>
          {items.map(i => i.product && (
            <div key={i.product._id} className="flex-between mb-1" style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--gray-700)' }}>{i.product.name} × {i.quantity}</span>
              <span>PKR {((i.product.discountedPrice || i.product.price) * i.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="divider" />
          <div className="flex-between mb-1"><span className="text-muted">Subtotal</span><span>PKR {cartTotal.toLocaleString()}</span></div>
          <div className="flex-between mb-1"><span className="text-muted">Tax (5%)</span><span>PKR {tax.toLocaleString()}</span></div>
          <div className="flex-between mb-1"><span className="text-muted">Shipping</span><span>{shipping===0?'Free':`PKR ${shipping}`}</span></div>
          {discount > 0 && <div className="flex-between mb-1" style={{color:'var(--green-700)'}}><span>Discount</span><span>- PKR {discount}</span></div>}
          <div className="divider" />
          <div className="flex-between mb-3"><strong>Total</strong><strong style={{fontSize:'1.25rem',color:'var(--green-800)'}}>PKR {total.toLocaleString()}</strong></div>
          <button className="btn btn-primary btn-block btn-lg" onClick={placeOrder} disabled={loading}>
            {loading ? 'Placing Order...' : `Place Order (PKR ${total.toLocaleString()})`}
          </button>
        </div>
      </div>
    </div>
  );
}
