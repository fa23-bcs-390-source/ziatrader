import React, { useEffect, useState } from 'react';
import { cmsAPI } from '../utils/api';
import Spinner from '../components/common/Spinner';

export default function About() {
  const [page, setPage] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      cmsAPI.getOne('about').catch(() => ({ data: { page: null } })),
      cmsAPI.getOne('shop-info').catch(() => ({ data: { page: null } })),
    ])
      .then(([about, shopInfo]) => {
        setPage(about.data.page);
        setShop(shopInfo.data.page);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container section"><Spinner /></div>;

  const title = page?.title || 'About Zia Traders & Co.';
  const content = page?.content || 'Zia Traders & Co. is a leading e-commerce platform committed to delivering quality products and exceptional customer service. With years of experience in the trading industry, we serve customers across Pakistan with a wide range of premium products.';
  const meta = page?.meta || {};
  const shopMeta = shop?.meta || {};

  return (
    <div className="about-page">
      <section className="page-hero">
        <div className="container">
          <h1>{title}</h1>
          <p>{page?.excerpt || 'Your trusted partner for quality products and reliable service'}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content card p-4">
              {page?.images?.[0] && (
                <img src={page.images[0]} alt={title} style={{ width: '100%', borderRadius: 12, marginBottom: '1.5rem', maxHeight: 320, objectFit: 'cover' }} />
              )}
              <div className="about-text" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
            </div>
            <div className="about-sidebar">
              <div className="card p-4 mb-3">
                <h3 style={{ marginBottom: '1rem' }}>Company Info</h3>
                <ul className="info-list">
                  {meta.contactEmail && <li>📧 {meta.contactEmail}</li>}
                  {meta.contactPhone && <li>📞 {meta.contactPhone}</li>}
                  {meta.address && <li>📍 {meta.address}</li>}
                  {meta.businessHours && <li>🕐 {meta.businessHours}</li>}
                </ul>
              </div>
              {(shop || shopMeta) && (
                <div className="card p-4">
                  <h3 style={{ marginBottom: '1rem' }}>Shop Information</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>
                    {shop?.content || 'Visit our store for in-person assistance and product demonstrations.'}
                  </p>
                  {shopMeta.policies && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                      <strong style={{ fontSize: '0.85rem' }}>Policies</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>{shopMeta.policies}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
