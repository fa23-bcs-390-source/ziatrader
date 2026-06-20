import React, { useEffect, useState } from 'react';
import { cmsAPI } from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const PAGE_TABS = [
  { slug: 'homepage', label: 'Homepage', fields: ['heroTitle', 'heroSubtitle', 'heroImage', 'promoText', 'promoLink'] },
  { slug: 'about', label: 'About Page', fields: ['contactEmail', 'contactPhone', 'address', 'businessHours'] },
  { slug: 'shop-info', label: 'Shop Info', fields: ['contactEmail', 'contactPhone', 'address', 'policies'] },
];

export default function AdminCMS() {
  const [pages, setPages] = useState({});
  const [activeTab, setActiveTab] = useState('homepage');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', excerpt: '', images: [''], meta: {} });

  useEffect(() => {
    cmsAPI.getAdmin()
      .then(({ data }) => {
        const map = {};
        data.pages.forEach(p => { map[p.slug] = p; });
        setPages(map);
        if (map.homepage) setFormFromPage(map.homepage);
      })
      .finally(() => setLoading(false));
  }, []);

  const setFormFromPage = (page) => {
    setForm({
      title: page?.title || '',
      content: page?.content || '',
      excerpt: page?.excerpt || '',
      images: page?.images?.length ? page.images : [''],
      meta: page?.meta || {},
    });
  };

  const switchTab = (slug) => {
    setActiveTab(slug);
    setFormFromPage(pages[slug] || { slug });
  };

  const updateMeta = (key, val) => setForm(f => ({ ...f, meta: { ...f.meta, [key]: val } }));
  const updateImage = (idx, val) => {
    const imgs = [...form.images];
    imgs[idx] = val;
    setForm(f => ({ ...f, images: imgs }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: activeTab,
        images: form.images.filter(Boolean),
        isPublished: true,
      };
      const { data } = await cmsAPI.update(activeTab, payload);
      setPages(prev => ({ ...prev, [activeTab]: data.page }));
      toast.success('Content saved! Changes are live on the website.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const tab = PAGE_TABS.find(t => t.slug === activeTab);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header-flex">
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>Content Management</h1>
          <p className="text-muted">Manage website pages — changes appear instantly on the frontend</p>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      <div className="cms-tabs">
        {PAGE_TABS.map(t => (
          <button key={t.slug} className={`cms-tab ${activeTab === t.slug ? 'active' : ''}`} onClick={() => switchTab(t.slug)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card p-4">
        <div className="form-group">
          <label className="form-label">Page Title</label>
          <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Excerpt / Summary</label>
          <input className="form-control" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Content</label>
          <textarea className="form-control" rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Image URL</label>
          <input className="form-control" value={form.images[0] || ''} onChange={e => updateImage(0, e.target.value)} placeholder="https://..." />
        </div>

        <h3 style={{ fontSize: '1rem', margin: '1.5rem 0 1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>Section Settings</h3>
        <div className="grid-2">
          {tab?.fields.map(field => (
            <div key={field} className="form-group">
              <label className="form-label">{field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
              <input className="form-control" value={form.meta[field] || ''} onChange={e => updateMeta(field, e.target.value)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
