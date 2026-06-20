import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { StarRating, Price } from '../common/Spinner';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();
  if (!product) return null;

  const discount = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-image-link">
        <div className="product-image-wrap">
          <img
            src={product.images?.[0] || 'https://placehold.co/300x220/e8f5e9/2d6a4f?text=Product'}
            alt={product.name}
            loading="lazy"
          />
          {discount > 0 && <span className="discount-tag">-{discount}%</span>}
          {product.stock === 0 && <div className="out-of-stock-overlay">Out of Stock</div>}
        </div>
      </Link>

      <div className="product-body">
        <div className="product-category">{product.category?.name || 'Agrochemical'}</div>
        <Link to={`/products/${product._id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>

        <div className="product-meta">
          <StarRating rating={product.ratings || 0} />
          <span className="product-reviews">({product.numReviews || 0})</span>
        </div>

        {product.stock > 0 && product.stock <= 10 && (
          <p style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.25rem' }}>
            ⚠️ Only {product.stock} left
          </p>
        )}

        <div className="product-footer">
          <Price original={product.price} discounted={product.discountedPrice} />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => addToCart(product._id)}
            disabled={loading || product.stock === 0}
          >
            {product.stock === 0 ? 'Sold Out' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
