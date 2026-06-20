import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI, invoiceAPI } from '../utils/api';
import Spinner, { StatusBadge } from '../components/common/Spinner';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([orderAPI.getOne(id), invoiceAPI.get(id)])
      .then(([o, inv]) => { setOrder(o.data.order); setInvoice(inv.data.invoice); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container section"><Spinner /></div>;
  if (!order) return <div className="container section"><p>Order not found.</p></div>;

  const printInvoice = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Invoice ${invoice?.invoiceNo}</title>
      <style>body{font-family:sans-serif;padding:2rem;max-width:600px;margin:0 auto}
      h1{color:#1b4332}table{width:100%;border-collapse:collapse;margin:1rem 0}
      th,td{padding:.5rem;text-align:left;border-bottom:1px solid #eee}
      .total{font-size:1.2rem;font-weight:bold;color:#1b4332}</style></head>
      <body>
        <h1>🏪 Zia Traders & Co.</h1>
        <p><strong>Invoice #:</strong> ${invoice?.invoiceNo}</p>
        <p><strong>Date:</strong> ${new Date(invoice?.date).toLocaleDateString()}</p>
        <p><strong>Customer:</strong> ${invoice?.customer?.name} (${invoice?.customer?.email})</p>
        <h3>Items</h3>
        <table><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        ${invoice?.items?.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>PKR ${i.price}</td><td>PKR ${i.price * i.quantity}</td></tr>`).join('')}
        </table>
        <p>Shipping: PKR ${invoice?.shippingCost}</p>
        <p>Discount: PKR ${invoice?.discount}</p>
        <p class="total">TOTAL: PKR ${invoice?.total?.toLocaleString()}</p>
        <p>Payment: ${invoice?.paymentMethod?.toUpperCase()} | Status: ${invoice?.paymentStatus}</p>
      </body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: 800 }}>
      <div className="flex-between mb-3">
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>Order #{order._id.slice(-6).toUpperCase()}</h1>
          <p className="text-muted">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-1">
          <StatusBadge status={order.orderStatus} />
          <button className="btn btn-secondary btn-sm" onClick={printInvoice}>🖨️ Print Invoice</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Items */}
        <div className="card p-3" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '1rem' }}>Order Items</h3>
          {order.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--gray-100)' }}>
              <img src={item.image || 'https://placehold.co/60x60/e8f5e9/2d6a4f?text=P'} alt={item.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <strong>{item.name}</strong>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Qty: {item.quantity} × PKR {item.price?.toLocaleString()}</p>
              </div>
              <strong style={{ color: 'var(--green-800)' }}>PKR {(item.price * item.quantity)?.toLocaleString()}</strong>
            </div>
          ))}
          <div style={{ paddingTop: '1rem' }}>
            <div className="flex-between mb-1 text-muted" style={{ fontSize: '0.875rem' }}><span>Subtotal</span><span>PKR {order.subtotal?.toLocaleString()}</span></div>
            {order.discount > 0 && <div className="flex-between mb-1" style={{ fontSize: '0.875rem', color: 'var(--green-700)' }}><span>Discount</span><span>- PKR {order.discount?.toLocaleString()}</span></div>}
            <div className="flex-between mb-1 text-muted" style={{ fontSize: '0.875rem' }}><span>Shipping</span><span>{order.shippingCost === 0 ? 'Free' : `PKR ${order.shippingCost}`}</span></div>
            <div className="flex-between" style={{ fontWeight: 700, fontSize: '1.1rem', borderTop: '2px solid var(--gray-200)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <span>Total</span><span style={{ color: 'var(--green-800)' }}>PKR {order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="card p-3">
          <h3 style={{ marginBottom: '0.75rem' }}>📍 Shipping Address</h3>
          <p>{order.shippingAddress?.street}</p>
          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
          <p>📞 {order.shippingAddress?.phone}</p>
        </div>

        {/* Order timeline */}
        <div className="card p-3">
          <h3 style={{ marginBottom: '0.75rem' }}>📋 Order Timeline</h3>
          {order.statusHistory?.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green-600)', marginTop: 5, flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{s.status}</strong>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(s.timestamp).toLocaleString()}</p>
                {s.note && <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{s.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1 mt-3">
        <Link to="/orders" className="btn btn-outline">← Back to Orders</Link>
        {['placed','confirmed'].includes(order.orderStatus) && (
          <button className="btn btn-danger" onClick={async () => {
            await orderAPI.cancel(id, { reason: 'Customer cancelled' });
            toast.success('Order cancelled');
            setOrder(prev => ({ ...prev, orderStatus: 'cancelled' }));
          }}>Cancel Order</button>
        )}
      </div>
    </div>
  );
}
