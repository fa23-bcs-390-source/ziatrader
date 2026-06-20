import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../utils/api';
import ProductCard from '../components/products/ProductCard';
import Spinner, { EmptyState, PageHeader } from '../components/common/Spinner';
import './Products.css';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [pages,      setPages]      = useState(1);
  const [loading,    setLoading]    = useState(true);

  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    category: searchParams.get('category') || '',
    cropType: searchParams.get('cropType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort:     searchParams.get('sort')     || 'newest',
    page:     Number(searchParams.get('page')) || 1,
  });

  const cropTypes = ['Wheat','Rice','Cotton','Maize','Sugarcane','Vegetables','Fruits','Pulses'];
  const sortOptions = [
    { value: 'newest',     label: 'Newest First' },
    { value: 'price_asc',  label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating',     label: 'Top Rated' },
    { value: 'popular',    label: 'Most Popular' },
  ];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== ''));
      const { data } = await productAPI.getAll(params);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    categoryAPI.getAll().then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  };

  const clearFilters = () => setFilters({ search:'', category:'', cropType:'', minPrice:'', maxPrice:'', sort:'newest', page:1 });

  return (
    <div className="products-page">
      <div className="container">
        <PageHeader
          title="All Products"
          subtitle={`${total} products available`}
          action={
            <div className="flex gap-1">
              <select className="form-control" value={filters.sort} onChange={e => updateFilter('sort', e.target.value)} style={{ width: 'auto' }}>
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          }
        />

        {/* Search bar */}
        <div className="search-bar-row">
          <div className="search-input-wrap">
            <input
              className="form-control search-input"
              placeholder="🔍 Search products, chemicals, crop solutions..."
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
            />
          </div>
        </div>

        <div className="products-layout">
          {/* Sidebar filters */}
          <aside className="filters-sidebar">
            <div className="filter-section">
              <h4>Categories</h4>
              <label className="filter-item">
                <input type="radio" name="cat" checked={!filters.category} onChange={() => updateFilter('category', '')} />
                <span>All Categories</span>
              </label>
              {categories.map(c => (
                <label key={c._id} className="filter-item">
                  <input type="radio" name="cat" checked={filters.category === c._id} onChange={() => updateFilter('category', c._id)} />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>

            <div className="filter-section">
              <h4>Crop Type</h4>
              <label className="filter-item">
                <input type="radio" name="crop" checked={!filters.cropType} onChange={() => updateFilter('cropType', '')} />
                <span>All Crops</span>
              </label>
              {cropTypes.map(c => (
                <label key={c} className="filter-item">
                  <input type="radio" name="crop" checked={filters.cropType === c} onChange={() => updateFilter('cropType', c)} />
                  <span>{c}</span>
                </label>
              ))}
            </div>

            <div className="filter-section">
              <h4>Price Range (PKR)</h4>
              <div className="price-range">
                <input className="form-control" type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} />
                <span>–</span>
                <input className="form-control" type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} />
              </div>
            </div>

            <button className="btn btn-outline btn-block btn-sm" onClick={clearFilters}>Clear All Filters</button>
          </aside>

          {/* Product grid */}
          <div className="products-main">
            {loading ? (
              <Spinner />
            ) : products.length === 0 ? (
              <EmptyState icon="🌾" title="No products found" desc="Try adjusting your filters or search terms" action={<button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>} />
            ) : (
              <>
                <div className="grid-3">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="pagination">
                    <button className="btn btn-outline btn-sm" disabled={filters.page <= 1} onClick={() => updateFilter('page', filters.page - 1)}>← Prev</button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <button key={p} className={`btn btn-sm ${filters.page === p ? 'btn-primary' : 'btn-outline'}`} onClick={() => updateFilter('page', p)}>{p}</button>
                    ))}
                    <button className="btn btn-outline btn-sm" disabled={filters.page >= pages} onClick={() => updateFilter('page', filters.page + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
