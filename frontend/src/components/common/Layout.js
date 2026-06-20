import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotif } from '../../context/CartContext';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { unread } = useNotif();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/agronomist', label: 'Support' },
    { to: '/blog', label: 'Blog' },
  ];

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <div className="container nav-inner">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">🏪</span>
            <span className="logo-text">Zia Traders<span>& Co.</span></span>
          </Link>

          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {navLinks.map(l => (
              <li key={l.to}>
                <Link to={l.to} className={location.pathname === l.to ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            {user ? (
              <>
                <Link to="/cart" className="nav-icon-btn" title="Cart">
                  🛒
                  {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
                </Link>
                <div className="user-dropdown" onMouseEnter={() => setDropOpen(true)} onMouseLeave={() => setDropOpen(false)}>
                  <button className="user-avatar-btn">
                    <img src={user.avatar} alt={user.name} className="user-avatar" />
                    <span className="hide-mobile">{user.name.split(' ')[0]}</span>
                    <span>▾</span>
                  </button>
                  {dropOpen && (
                    <div className="dropdown-menu">
                      <div className="dropdown-header">
                        <strong>{user.name}</strong>
                        <small>{user.role}</small>
                      </div>
                      <Link to="/profile" onClick={() => setDropOpen(false)}>👤 My Profile</Link>
                      <Link to="/orders" onClick={() => setDropOpen(false)}>📦 My Orders</Link>
                      <Link to="/queries" onClick={() => setDropOpen(false)}>❓ My Queries</Link>
                      <Link to="/chat" onClick={() => setDropOpen(false)}>💬 Messages {unread > 0 && <span className="badge-count small">{unread}</span>}</Link>
                      {user.role === 'agronomist' && (
                        <>
                          <div className="dropdown-divider" />
                          <Link to="/agronomist-portal" onClick={() => setDropOpen(false)}>🌿 Agronomist Portal</Link>
                        </>
                      )}
                      {user.role === 'seller' && (
                        <>
                          <div className="dropdown-divider" />
                          <Link to="/seller/dashboard" onClick={() => setDropOpen(false)}>🏪 Seller Dashboard</Link>
                        </>
                      )}
                      {user.role === 'admin' && (
                        <>
                          <div className="dropdown-divider" />
                          <Link to="/admin" onClick={() => setDropOpen(false)}>⚙️ Admin Panel</Link>
                        </>
                      )}
                      <div className="dropdown-divider" />
                      <button onClick={handleLogout} className="dropdown-logout">🚪 Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn btn-outline btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">🏪 Zia Traders<span>& Co.</span></div>
              <p>Your trusted partner for quality products, expert support, and reliable service across Pakistan.</p>
            </div>
            <div>
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/products">Shop Products</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/agronomist">Customer Support</Link></li>
                <li><Link to="/blog">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4>Account</h4>
              <ul>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/orders">My Orders</Link></li>
                <li><Link to="/profile">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li>📧 info@ziatraders.pk</li>
                <li>📞 +92-300-0000000</li>
                <li>📍 Lahore, Pakistan</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Zia Traders & Co. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
