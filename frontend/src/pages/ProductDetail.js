import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI, reviewAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Spinner, { StarRating, Price, StatusBadge } from '../components/common/Spinner';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('description');

  useEffect(() => {
    Promise.all([productAPI.getOne(id), reviewAPI.getByProduct(id)])
      .then(([p, r]) => { setProduct(p.data.product); setRelated(p.data.related || []); setReviews(r.data.reviews); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to write a review'); return; }
    setSubmitting(true);
    try {
      const { data } = await reviewAPI.create({ ...reviewForm, product: id });
      setReviews(prev => [data.review, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch(err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="container section"><Spinner /></div>;
  if (!product) return <div className="container section"><p>Product not found.</p><Link to="/products" className="btn btn-primary mt-2">Browse Products</Link></div>;

  const images = product.images?.length ? product.images : ['https://placehold.co/500x400/e8f5e9/2d6a4f?text=Product'];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
        <Link to="/">Home</Link> → <Link to="/products">Products</Link> → {product.name}
      </div>

      <div className="product-detail-grid">
        {/* Images */}
        <div>
          <div style={{ background: 'var(--green-50)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '0.75rem', height: 380 }}>
            <img src={images[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{ width: 70, height: 70, border: `2px solid ${activeImg === i ? 'var(--green-600)' : 'var(--gray-200)'}`, borderRadius: 8, overflow: 'hidden', padding: 0, background: 'none' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="badge badge-green mb-2">{product.category?.name}</div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <StarRating rating={product.ratings} size="lg" />
            <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>({product.numReviews} reviews)</span>
          </div>
          <Price original={product.price} discounted={product.discountedPrice} size="lg" />

          {product.brand && <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>Brand: <strong>{product.brand}</strong></p>}
          {product.sku && <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>SKU: <strong>{product.sku}</strong></p>}

          <div style={{ margin: '1.25rem 0', padding: '1rem', background: 'var(--green-50)', borderRadius: 'var(--radius)' }}>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', flexWrap: 'wrap' }}>
              <span>📦 Stock: <strong>{product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}</strong></span>
              <span>Status: <StatusBadge status={product.stockStatus || (product.stock > 0 ? 'active' : 'inactive')} /></span>
              {product.unit && <span>⚖️ Unit: <strong>{product.unit}</strong></span>}
              {product.expiryDate && <span>📅 Expiry: <strong>{new Date(product.expiryDate).toLocaleDateString()}</strong></span>}
            </div>
          </div>

          {product.cropTypes?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '0.4rem' }}>SUITABLE FOR CROPS:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {product.cropTypes.map(c => <span key={c} className="badge badge-green">{c}</span>)}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--gray-200)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <button style={{ padding: '0.5rem 0.85rem', background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 700 }} onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span style={{ padding: '0.5rem 1rem', fontWeight: 700, borderLeft: '1px solid var(--gray-200)', borderRight: '1px solid var(--gray-200)' }}>{qty}</span>
              <button style={{ padding: '0.5rem 0.85rem', background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 700 }} onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
            </div>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => addToCart(product._id, qty)} disabled={product.stock === 0}>
              {product.stock === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
            </button>
          </div>

          {product.dosage && (
            <div style={{ padding: '0.85rem', background: '#fef3c7', borderRadius: 'var(--radius)', borderLeft: '4px solid #f59e0b', fontSize: '0.875rem' }}>
              <strong>💊 Recommended Dosage:</strong> {product.dosage}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid var(--gray-200)', display: 'flex', gap: '0', marginBottom: '2rem' }}>
        {['description','specifications','reviews'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize', color: tab === t ? 'var(--green-800)' : 'var(--gray-500)', borderBottom: tab === t ? '2px solid var(--green-700)' : '2px solid transparent', marginBottom: '-2px', transition: 'all 0.2s' }}>
            {t === 'reviews' ? `Reviews (${reviews.length})` : t}
          </button>
        ))}
      </div>

      {tab === 'description' && (
        <div style={{ maxWidth: 700, lineHeight: 1.8, color: 'var(--gray-700)' }}>
          <p>{product.description}</p>
          {product.activeIngredients?.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <strong>Active Ingredients:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                {product.activeIngredients.map(i => <li key={i}>{i}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === 'specifications' && (
        <div style={{ maxWidth: 700 }}>
          {product.specifications?.length > 0 ? (
            <table className="data-table" style={{ width: '100%' }}>
              <tbody>
                {product.specifications.map((s, i) => (
                  <tr key={i}><td style={{ fontWeight: 600, width: '40%' }}>{s.key}</td><td>{s.value}</td></tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted">No specifications listed for this product.</p>
          )}
          {product.safetyInstructions && (
            <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: 'var(--radius)', marginTop: '1rem' }}>
              <strong>⚠️ Safety Instructions</strong>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', lineHeight: 1.7 }}>{product.safetyInstructions}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'reviews' && (
        <div style={{ maxWidth: 700 }}>
          {user && (
            <form onSubmit={submitReview} className="card p-3 mb-3">
              <h4 style={{ marginBottom: '1rem' }}>Write a Review</h4>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[1,2,3,4,5].map(s => (
                    <button type="button" key={s} onClick={() => setReviewForm(p => ({...p, rating: s}))} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                      {s <= reviewForm.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Your Review</label>
                <textarea className="form-control" rows={3} placeholder="Share your experience..." value={reviewForm.comment} onChange={e => setReviewForm(p => ({...p, comment: e.target.value}))} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
            </form>
          )}
          {reviews.length === 0 ? <p className="text-muted">No reviews yet. Be the first to review!</p> : reviews.map(r => (
            <div key={r._id} style={{ borderBottom: '1px solid var(--gray-100)', padding: '1rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <img src={r.user?.avatar} alt={r.user?.name} style={{ width: 36, height: 36, borderRadius: '50%' }} />
                <div>
                  <strong style={{ fontSize: '0.875rem' }}>{r.user?.name}</strong>
                  <div><StarRating rating={r.rating} /></div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--gray-500)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid var(--gray-200)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Related Products</h2>
          <div className="grid-4 product-grid-responsive">
            {related.map(p => (
              <Link key={p._id} to={`/products/${p._id}`} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                <img src={p.images?.[0] || 'https://placehold.co/200x150/e8eef5/1e3a5f?text=P'} alt={p.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: '0.75rem' }} />
                <strong style={{ fontSize: '0.875rem' }}>{p.name}</strong>
                <p style={{ color: 'var(--green-800)', fontWeight: 700, marginTop: '0.25rem' }}>PKR {(p.discountedPrice || p.price)?.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
