import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../utils/api';
import Spinner, { EmptyState, StatusBadge } from '../components/common/Spinner';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getMy().then(({ data }) => setOrders(data.orders)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container section"><Spinner /></div>;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders yet" desc="Shop our products and your orders will appear here" action={<Link to="/products" className="btn btn-primary">Start Shopping</Link>} />
      ) : (
        <div>
          {orders.map(order => (
            <div key={order._id} className="card p-3 mb-2">
              <div className="flex-between mb-2">
                <div>
                  <strong style={{ fontSize: '0.9rem' }}>Order #{order._id.slice(-6).toUpperCase()}</strong>
                  <p className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={order.orderStatus} />
                  <p style={{ marginTop: '0.25rem', fontWeight: 700, color: 'var(--green-800)' }}>PKR {order.totalAmount?.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-1" style={{ flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {order.items?.slice(0, 3).map((item, i) => (
                  <span key={i} style={{ fontSize: '0.8rem', background: 'var(--gray-100)', padding: '0.2rem 0.6rem', borderRadius: 100 }}>
                    {item.name} × {item.quantity}
                  </span>
                ))}
                {order.items?.length > 3 && <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>+{order.items.length - 3} more</span>}
              </div>
              <div className="flex gap-1">
                <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm">View Details</Link>
                {['placed','confirmed'].includes(order.orderStatus) && (
                  <button className="btn btn-danger btn-sm" onClick={async () => {
                    await orderAPI.cancel(order._id, { reason: 'Customer cancelled' });
                    setOrders(prev => prev.map(o => o._id === order._id ? { ...o, orderStatus: 'cancelled' } : o));
                  }}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
