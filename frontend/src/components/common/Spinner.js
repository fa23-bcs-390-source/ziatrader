import React from 'react';

export default function Spinner({ size = 'md', center = true }) {
  const cls = size === 'sm' ? 'spinner spinner-sm' : 'spinner';
  if (center) return <div className="spinner-container"><div className={cls} /></div>;
  return <div className={cls} />;
}

// Star rating display
export function StarRating({ rating, max = 5, size = 'sm' }) {
  return (
    <span style={{ fontSize: size === 'lg' ? '1.1rem' : '0.85rem', letterSpacing: '0.05em' }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? 'star' : 'star-empty'}>★</span>
      ))}
    </span>
  );
}

// Empty state
export function EmptyState({ icon = '📭', title, desc, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
      {desc && <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{desc}</p>}
      {action}
    </div>
  );
}

// Page header
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ marginBottom: '2rem' }} className="flex-between">
      <div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{title}</h1>
        {subtitle && <p className="text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// Price display
export function Price({ original, discounted, size = 'md' }) {
  const fs = size === 'lg' ? '1.4rem' : '1rem';
  return (
    <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
      <strong style={{ fontSize: fs, color: 'var(--green-800)' }}>
        PKR {(discounted || original)?.toLocaleString()}
      </strong>
      {discounted && discounted < original && (
        <s style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>PKR {original?.toLocaleString()}</s>
      )}
    </div>
  );
}

// Status badge
export function StatusBadge({ status }) {
  const map = {
    placed:      'badge-gray',
    confirmed:   'badge-green',
    processing:  'badge-amber',
    shipped:     'badge-amber',
    delivered:   'badge-green',
    cancelled:   'badge-red',
    returned:    'badge-red',
    pending:     'badge-amber',
    paid:        'badge-green',
    failed:      'badge-red',
    active:      'badge-green',
    inactive:    'badge-red',
    approved:    'badge-green',
    rejected:    'badge-red',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}
