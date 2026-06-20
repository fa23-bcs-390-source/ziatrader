import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI, cmsAPI } from '../utils/api';
import ProductCard from '../components/products/ProductCard';
import Spinner from '../components/common/Spinner';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cms, setCms] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productAPI.getFeatured(),
      productAPI.getLatest(),
      productAPI.getBestSellers(),
      categoryAPI.getAll(),
      cmsAPI.getOne('homepage').catch(() => ({ data: { page: null } })),
    ])
      .then(([f, l, b, c, cmsRes]) => {
        setFeatured(f.data.products);
        setLatest(l.data.products);
        setBestsellers(b.data.products);
        setCategories(c.data.categories);
        setCms(cmsRes.data.page);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const stats = [
    { icon: '📦', value: '5,000+', label: 'Quality Products' },
    { icon: '🏆', value: '15+', label: 'Years Experience' },
    { icon: '👥', value: '10,000+', label: 'Happy Customers' },
    { icon: '🚚', value: 'Nationwide', label: 'Delivery Network' },
  ];

  const whyUs = [
    { icon: '✅', title: 'Quality Assured', desc: 'Every product is verified for quality and authenticity before reaching you.' },
    { icon: '💬', title: 'Expert Support', desc: 'Our agronomist team is ready to answer your questions and guide your purchases.' },
    { icon: '🛒', title: 'Easy Shopping', desc: 'Browse, compare, and order online with a seamless cart and checkout experience.' },
    { icon: '⚡', title: 'Fast Delivery', desc: 'Reliable shipping across Pakistan with real-time order tracking.' },
  ];

  const heroTitle = cms?.meta?.heroTitle || 'Quality Products, Trusted Service';
  const heroSubtitle = cms?.meta?.heroSubtitle || 'Shop premium products from Zia Traders & Co. — your reliable e-commerce partner for quality goods and expert customer support.';
  const promoText = cms?.meta?.promoText;

  const ProductSection = ({ title, desc, products, bg }) => (
    <section className={`section ${bg ? 'section-alt' : ''}`}>
      <div className="container">
        <div className="section-heading">
          <h2>{title}</h2>
          <p>{desc}</p>
        </div>
        {loading ? (
          <Spinner />
        ) : products.length > 0 ? (
          <>
            <div className="grid-4 product-grid-responsive">
              {products.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
            <div className="text-center mt-4">
              <Link to="/products" className="btn btn-outline btn-lg">View All Products →</Link>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Products coming soon. Check back shortly!</p>
            <Link to="/products" className="btn btn-primary mt-2">Browse Shop</Link>
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-bg-pattern" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-text animate-fadeUp">
              <span className="hero-badge">🏪 Zia Traders & Co.</span>
              <h1 className="hero-title">{heroTitle}</h1>
              <p className="hero-subtitle">{heroSubtitle}</p>
              <form className="hero-search" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="hero-search-input"
                />
                <button type="submit" className="btn btn-primary">Search</button>
              </form>
              <div className="hero-ctas">
                <Link to="/products" className="btn btn-primary btn-lg">Shop Now 🛒</Link>
                <Link to="/about" className="btn btn-outline btn-lg">About Us</Link>
              </div>
              {promoText && <p className="hero-promo">{promoText}</p>}
            </div>
            <div className="hero-visual">
              <div className="hero-card-stack">
                <div className="hero-floating-card card1">
                  <span>⭐</span>
                  <div><strong>Top Rated</strong><small>Trusted by thousands</small></div>
                </div>
                <div className="hero-floating-card card2">
                  <span>🚚</span>
                  <div><strong>Fast Delivery</strong><small>Nationwide shipping</small></div>
                </div>
                <div className="hero-illustration">🏪</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-item">
                <span className="stat-icon">{s.icon}</span>
                <strong className="stat-value">{s.value}</strong>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-heading">
              <h2>Shop by Category</h2>
              <p>Browse our complete product range organized for your convenience</p>
            </div>
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link key={cat._id} to={`/products?category=${cat._id}`} className="category-chip">
                  <img src={cat.image || `https://placehold.co/80x80/e8eef5/1e3a5f?text=${cat.name[0]}`} alt={cat.name} />
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProductSection title="Featured Products" desc="Hand-picked favorites from our catalog" products={featured} bg />
      <ProductSection title="Latest Arrivals" desc="Fresh additions to our inventory" products={latest} />
      <ProductSection title="Best Sellers" desc="Most popular products loved by our customers" products={bestsellers} bg />

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h2>Why Choose Zia Traders & Co.?</h2>
            <p>Your complete e-commerce solution with quality products and expert support</p>
          </div>
          <div className="grid-4 feature-grid-responsive">
            {whyUs.map((w, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{w.icon}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="diagnosis-cta">
        <div className="container">
          <div className="cta-inner">
            <div className="cta-text">
              <h2>Need Help? We're Here for You 💬</h2>
              <p>Submit a query or book an appointment with our expert agronomist team for personalized product guidance.</p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/queries" className="btn btn-primary btn-lg">Submit a Query →</Link>
                <Link to="/agronomist" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'white' }}>Book Appointment</Link>
              </div>
            </div>
            <div className="cta-visual">💬</div>
          </div>
        </div>
      </section>
    </div>
  );
}
