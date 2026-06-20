import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { EmptyState, Price } from '../components/common/Spinner';

export default function Cart() {
  const { items, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div className="container section">
      <EmptyState icon="🛒" title="Your cart is empty" desc="Add some products to get started!" action={<Link to="/products" className="btn btn-primary">Browse Products</Link>} />
    </div>
  );

  const shipping = cartTotal >= 2000 ? 0 : 150;
  const total = cartTotal + shipping;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div className="flex-between mb-3">
        <h1 style={{ fontSize: '1.75rem' }}>Shopping Cart</h1>
        <button className="btn btn-danger btn-sm" onClick={clearCart}>Clear Cart</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        <div>
          {items.map(item => {
            const p = item.product;
            if (!p) return null;
            const price = p.discountedPrice || p.price;
            return (
              <div key={p._id} className="card p-3 mb-2" style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '1rem', alignItems: 'center' }}>
                <Link to={`/products/${p._id}`}>
                  <img src={p.images?.[0] || 'https://placehold.co/80x80/e8f5e9/2d6a4f?text=P'} alt={p.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                </Link>
                <div>
                  <Link to={`/products/${p._id}`}><strong>{p.name}</strong></Link>
                  <Price original={p.price} discounted={p.discountedPrice} />
                  <div className="flex gap-1 mt-1">
                    <button className="btn btn-outline btn-sm" onClick={() => item.quantity > 1 ? updateQuantity(p._id, item.quantity - 1) : removeFromCart(p._id)}>−</button>
                    <span style={{ padding: '0.4rem 0.75rem', background: 'var(--gray-100)', borderRadius: 8, fontWeight: 600 }}>{item.quantity}</span>
                    <button className="btn btn-outline btn-sm" onClick={() => updateQuantity(p._id, item.quantity + 1)} disabled={item.quantity >= p.stock}>+</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: 'var(--green-800)', fontSize: '1.05rem' }}>PKR {(price * item.quantity).toLocaleString()}</strong>
                  <br />
                  <button className="btn btn-danger btn-sm mt-1" onClick={() => removeFromCart(p._id)}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="card p-3" style={{ position: 'sticky', top: 90 }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Order Summary</h3>
          <div className="flex-between mb-1"><span className="text-muted">Subtotal</span><strong>PKR {cartTotal.toLocaleString()}</strong></div>
          <div className="flex-between mb-1"><span className="text-muted">Shipping</span><strong>{shipping === 0 ? <span style={{ color: 'var(--green-700)' }}>Free</span> : `PKR ${shipping}`}</strong></div>
          {shipping > 0 && <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>Free shipping on orders over PKR 2,000</p>}
          <div className="divider" />
          <div className="flex-between mb-3"><strong>Total</strong><strong style={{ fontSize: '1.25rem', color: 'var(--green-800)' }}>PKR {total.toLocaleString()}</strong></div>
          <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/checkout')}>Proceed to Checkout →</button>
          <Link to="/products" className="btn btn-outline btn-block mt-2">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
