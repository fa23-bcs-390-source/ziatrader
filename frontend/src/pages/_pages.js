// Prescription.js
import React, { useState, useEffect } from 'react';
import { prescriptionAPI } from '../utils/api';
import Spinner, { StatusBadge } from '../components/common/Spinner';
import toast from 'react-hot-toast';

export function Prescription() {
  const [form, setForm] = useState({ cropType: '', symptoms: '', uploadedImage: '' });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('new');

  useEffect(() => {
    prescriptionAPI.getMy().then(({ data }) => setHistory(data.prescriptions)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.cropType || !form.symptoms) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const { data } = await prescriptionAPI.create(form);
      setResult(data.prescription);
      setHistory(prev => [data.prescription, ...prev]);
      toast.success('Analysis complete! 🔬');
    } catch { toast.error('Analysis failed'); }
    finally { setLoading(false); }
  };

  const crops = ['Wheat','Rice','Cotton','Maize','Sugarcane','Vegetables','Fruits','Pulses'];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: 800 }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🔬</div>
        <h1>Crop Disease Diagnosis</h1>
        <p className="text-muted">Describe your crop's symptoms and get instant AI-powered analysis with product recommendations</p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {['new','history'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} style={{ textTransform: 'capitalize' }}>{t === 'new' ? '+ New Diagnosis' : `📋 History (${history.length})`}</button>
        ))}
      </div>

      {tab === 'new' && (
        <div className="card p-4">
          {!result ? (
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Crop Type</label>
                <select className="form-control" value={form.cropType} onChange={e => setForm({ ...form, cropType: e.target.value })}>
                  <option value="">Select crop...</option>
                  {crops.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Describe Symptoms</label>
                <textarea className="form-control" rows={4} placeholder="e.g., yellowing leaves, brown spots on leaves, wilting, insect damage, rust-colored patches..." value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} />
                <p className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>Keywords: yellowing, spots, wilting, insects, rust, blight, rot, fungus</p>
              </div>
              <div className="form-group">
                <label className="form-label">Image URL (Optional)</label>
                <input className="form-control" type="url" placeholder="https://example.com/crop-photo.jpg" value={form.uploadedImage} onChange={e => setForm({ ...form, uploadedImage: e.target.value })} />
              </div>
              <button className="btn btn-primary btn-lg btn-block" disabled={loading}>{loading ? '🔬 Analysing...' : 'Analyse My Crop 🔬'}</button>
            </form>
          ) : (
            <div>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--green-50)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
                <h2 style={{ color: 'var(--green-800)', marginBottom: '0.5rem' }}>Detected: {result.detectedDisease}</h2>
                <p className="text-muted">Crop: {result.cropType}</p>
              </div>
              <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>
                <strong>💊 Recommended Treatments:</strong>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Browse our pesticide and fungicide section for targeted solutions for {result.detectedDisease}. Consult an agronomist for precise dosage.</p>
              </div>
              <div className="flex gap-1">
                <a href="/products" className="btn btn-primary">Shop Recommended Products</a>
                <button className="btn btn-outline" onClick={() => { setResult(null); setForm({ cropType:'', symptoms:'', uploadedImage:'' }); }}>New Diagnosis</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div>
          {history.length === 0 ? <p className="text-muted">No diagnoses yet.</p> : history.map(p => (
            <div key={p._id} className="card p-3 mb-2">
              <div className="flex-between">
                <div>
                  <strong>{p.cropType}</strong>
                  <p className="text-muted" style={{ fontSize: '0.8rem' }}>{p.symptoms?.slice(0, 80)}...</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-amber">{p.detectedDisease}</span>
                  <p className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Agronomist.js
export function Agronomist() {
  const [list, setList] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [bookForm, setBookForm] = useState({ agronomist:'', cropType:'', issue:'', scheduledAt:'' });
  const [tab, setTab] = useState('experts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { agronomistAPI } = require('../utils/api');
    Promise.all([agronomistAPI.getList(), agronomistAPI.getConsultations()])
      .then(([a, c]) => { setList(a.data.agronomists); setConsultations(c.data.consultations); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const book = async (e) => {
    e.preventDefault();
    const { agronomistAPI } = require('../utils/api');
    try {
      await agronomistAPI.bookConsultation(bookForm);
      toast.success('Consultation booked successfully! 👨‍🌾');
      setBookForm({ agronomist:'', cropType:'', issue:'', scheduledAt:'' });
    } catch(err) { toast.error(err.response?.data?.message || 'Booking failed'); }
  };

  if (loading) return <div className="container section"><Spinner /></div>;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>👨‍🌾</div>
        <h1>Expert Agronomists</h1>
        <p className="text-muted">Connect with certified agronomists for personalized crop advice</p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {['experts','book','consultations'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} style={{ textTransform: 'capitalize' }}>{t === 'book' ? '📅 Book' : t === 'experts' ? '👨‍🔬 Experts' : '📋 My Consultations'}</button>
        ))}
      </div>

      {tab === 'experts' && (
        <div className="grid-3">
          {list.length === 0 ? <p className="text-muted">No agronomists registered yet.</p> : list.map(a => (
            <div key={a._id} className="card p-3" style={{ textAlign: 'center' }}>
              <img src={a.avatar} alt={a.name} style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 0.75rem', border: '3px solid var(--green-400)' }} />
              <h3 style={{ fontSize: '1rem' }}>{a.name}</h3>
              <span className="badge badge-green mt-1">Agronomist</span>
              {a.phone && <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>📞 {a.phone}</p>}
              <button className="btn btn-primary btn-block btn-sm mt-2" onClick={() => { setBookForm(f => ({...f, agronomist: a._id})); setTab('book'); }}>Book Consultation</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'book' && (
        <div className="card p-4" style={{ maxWidth: 560 }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Book a Consultation</h3>
          <form onSubmit={book}>
            <div className="form-group">
              <label className="form-label">Select Agronomist</label>
              <select className="form-control" value={bookForm.agronomist} onChange={e => setBookForm({...bookForm, agronomist: e.target.value})}>
                <option value="">Choose agronomist...</option>
                {list.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Crop Type</label><input className="form-control" placeholder="e.g., Wheat" value={bookForm.cropType} onChange={e => setBookForm({...bookForm, cropType: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Describe Your Issue</label><textarea className="form-control" rows={3} placeholder="Describe the problem with your crops..." value={bookForm.issue} onChange={e => setBookForm({...bookForm, issue: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Preferred Date & Time</label><input className="form-control" type="datetime-local" value={bookForm.scheduledAt} onChange={e => setBookForm({...bookForm, scheduledAt: e.target.value})} /></div>
            <button className="btn btn-primary btn-block" type="submit">Confirm Booking</button>
          </form>
        </div>
      )}

      {tab === 'consultations' && (
        <div>
          {consultations.length === 0 ? <p className="text-muted">No consultations booked yet.</p> : consultations.map(c => (
            <div key={c._id} className="card p-3 mb-2">
              <div className="flex-between">
                <div>
                  <strong>{c.agronomist?.name || 'Agronomist'}</strong>
                  <p className="text-muted" style={{ fontSize: '0.8rem' }}>{c.cropType} — {c.issue?.slice(0, 60)}</p>
                  {c.scheduledAt && <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>📅 {new Date(c.scheduledAt).toLocaleString()}</p>}
                </div>
                <StatusBadge status={c.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Blog.js
export function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { blogAPI } = require('../utils/api');
    blogAPI.getAll().then(({ data }) => setBlogs(data.blogs)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="container section"><Spinner /></div>;
  return (
    <div className="container section">
      <div className="section-heading"><h2>Knowledge Base</h2><p>Expert farming tips, disease guides, and crop advice</p></div>
      {blogs.length === 0 ? <div style={{ textAlign:'center', padding:'3rem', color:'var(--gray-500)' }}>No articles published yet.</div> : (
        <div className="grid-3">
          {blogs.map(b => (
            <a key={b._id} href={`/blog/${b.slug}`} className="card" style={{ overflow:'hidden', display:'flex', flexDirection:'column', transition:'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ height:180, overflow:'hidden', background:'var(--green-50)' }}>
                <img src={b.image || 'https://placehold.co/400x180/e8f5e9/2d6a4f?text=Blog'} alt={b.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              <div className="p-3" style={{ flex:1 }}>
                <span className="badge badge-green mb-1">{b.category || 'Guide'}</span>
                <h3 style={{ fontSize:'1rem', marginBottom:'0.5rem' }}>{b.title}</h3>
                <p className="text-muted" style={{ fontSize:'0.8rem' }}>{b.excerpt?.slice(0,100)}...</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'1rem', fontSize:'0.75rem', color:'var(--gray-500)' }}>
                  <span>By {b.author?.name}</span>
                  <span>{b.views} views</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// BlogDetail.js
export function BlogDetail() {
  const { useParams } = require('react-router-dom');
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { blogAPI } = require('../utils/api');
    blogAPI.getOne(slug).then(({ data }) => setBlog(data.blog)).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);
  if (loading) return <div className="container section"><Spinner /></div>;
  if (!blog) return <div className="container section"><p>Article not found.</p></div>;
  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: 800 }}>
      <span className="badge badge-green mb-2">{blog.category || 'Guide'}</span>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: 1.3 }}>{blog.title}</h1>
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'2rem', fontSize:'0.875rem', color:'var(--gray-500)' }}>
        {blog.author?.avatar && <img src={blog.author.avatar} alt={blog.author.name} style={{ width:36,height:36,borderRadius:'50%' }} />}
        <span>By <strong>{blog.author?.name}</strong></span>
        <span>•</span><span>{new Date(blog.createdAt).toLocaleDateString()}</span>
        <span>•</span><span>{blog.views} views</span>
      </div>
      {blog.image && <img src={blog.image} alt={blog.title} style={{ width:'100%', height:320, objectFit:'cover', borderRadius:'var(--radius-lg)', marginBottom:'2rem' }} />}
      <div style={{ lineHeight:1.9, color:'var(--gray-700)', fontSize:'1rem' }}>{blog.content}</div>
      {blog.tags?.length > 0 && (
        <div style={{ marginTop:'2rem', display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
          {blog.tags.map(t => <span key={t} className="badge badge-gray">#{t}</span>)}
        </div>
      )}
    </div>
  );
}

// Chat.js
export function Chat() {
  const { useEffect: ue, useState: us } = require('react');
  const { useAuth } = require('../context/AuthContext');
  const { user } = useAuth();
  const [chats, setChats] = us([]);
  const [active, setActive] = us(null);
  const [msgs, setMsgs] = us([]);
  const [text, setText] = us('');

  ue(() => {
    const { chatAPI } = require('../utils/api');
    chatAPI.getMy().then(({ data }) => setChats(data.chats)).catch(() => {});
  }, []);

  const openChat = async (chat) => {
    setActive(chat);
    const { chatAPI } = require('../utils/api');
    const { data } = await chatAPI.getMessages(chat._id);
    setMsgs(data.messages);
  };

  const sendMsg = async () => {
    if (!text.trim() || !active) return;
    const { chatAPI } = require('../utils/api');
    // Optimistic update
    setMsgs(prev => [...prev, { sender: { _id: user._id, name: user.name, avatar: user.avatar }, content: text, timestamp: new Date() }]);
    setText('');
    // In production, this would go through socket.io
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', height: 'calc(100vh - 140px)', display: 'flex', gap: '1.5rem' }}>
      <div style={{ width: 300, background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', fontWeight: 700 }}>💬 Messages</div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.length === 0 ? <p style={{ padding: '1.5rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>No conversations yet</p> : chats.map(c => {
            const other = c.participants?.find(p => p._id !== user?._id);
            return (
              <button key={c._id} onClick={() => openChat(c)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', background: active?._id === c._id ? 'var(--green-50)' : 'none', border: 'none', borderBottom: '1px solid var(--gray-100)', cursor: 'pointer', textAlign: 'left' }}>
                <img src={other?.avatar || 'https://ui-avatars.com/api/?name=User'} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <strong style={{ fontSize: '0.875rem' }}>{other?.name || 'User'}</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage || 'Start chatting...'}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ flex: 1, background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column' }}>
        {!active ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--gray-500)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>💬</div>
            <p>Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', fontWeight: 600 }}>
              {active.participants?.find(p => p._id !== user?._id)?.name}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {msgs.map((m, i) => {
                const isMe = m.sender?._id === user?._id;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: '0.5rem', alignItems: 'flex-end' }}>
                    {!isMe && <img src={m.sender?.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />}
                    <div style={{ maxWidth: '65%', padding: '0.6rem 1rem', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isMe ? 'var(--green-700)' : 'var(--gray-100)', color: isMe ? 'white' : 'var(--gray-800)', fontSize: '0.875rem' }}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: '0.75rem' }}>
              <input className="form-control" placeholder="Type a message..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={sendMsg}>Send →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// NotFound.js
export function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🌾</div>
        <h1 style={{ fontSize: '4rem', color: 'var(--green-800)', marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>The crop you're looking for doesn't exist in our fields.</p>
        <a href="/" className="btn btn-primary btn-lg">← Back to Home</a>
      </div>
    </div>
  );
}
