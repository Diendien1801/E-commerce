// src/components/admin/ProductManagement.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './product.css';

const PAGE_SIZE = 5;

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState({});
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchProducts = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/products/admin?page=${pageNumber}&limit=${PAGE_SIZE}`);
      const data = await res.json();
      if (data.data && Array.isArray(data.data.products)) {
        const { products} = data.data;
        console.log('Fetched products:', data.data);
        setProducts(products);
        setFiltered(products);
        const ids = [...new Set(products.map((p) => p.idCategory).filter(Boolean))];
        ids.forEach(fetchCategoryById);
        setTotalPages(Math.ceil(data.data.pagination?.totalPages || 1));
      } else {
        setProducts([]);
        setFiltered([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setFiltered([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchedProducts = async (query, pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/products/admin/search?q=${encodeURIComponent(query)}&page=${pageNumber}&limit=${PAGE_SIZE}`);
      const data = await res.json();
      setFiltered(Array.isArray(data.data.products) ? data.data.products : []);
      setSearchTotalPages(Math.ceil(data.data.pagination?.totalPages || 1));
    } catch (err) {
      console.error('Search failed:', err);
      setFiltered([]);
      setSearchTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryById = async (id) => {
    if (!id || categoriesMap[id]) return;
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`);
      const data = await res.json();
      if (data && data.data) {
        setCategoriesMap((prev) => ({
          ...prev,
          [id]: data.data.name || 'Unknown'
        }));
      }
    } catch (err) {
      console.error(`Error fetching category ${id}:`, err);
      setCategoriesMap((prev) => ({
        ...prev,
        [id]: 'Unknown'
      }));
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim()) {
        fetchSearchedProducts(search.trim(), searchPage);
      } else {
        fetchProducts(page);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, searchPage, page]);

  // Reset page/searchPage when switching between search and normal
  useEffect(() => {
    if (search.trim()) {
      setPage(1);
    } else {
      setSearchPage(1);
    }
  }, [search]);

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div className="product-management-header">
        <h1 className="page-title">{t('productManagement', 'Product Management')}</h1>
        <button
          className="add-btn"
          onClick={() => navigate('/admin/create-product')}
        >
          + {t('addProduct', 'Add Product')}
        </button>
      </div>

      <input
        type="text"
        placeholder={t('searchbytitle', 'Search by title')}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setSearchPage(1);
        }}
        className="search-input"
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th>{t('id', 'ID')}</th>
                <th>{t('image', 'Image')}</th>
                <th>{t('title', 'Title')}</th>
                <th>{t('price', 'Price')}</th>
                <th style={{ textAlign: 'center' }}>{t('quantity', 'Quantity')}</th>
                <th style={{ textAlign: 'center' }}>{t('category', 'Category')}</th>
                <th style={{ textAlign: 'center' }}>{t('status1', 'Status')}</th>
                <th style={{ textAlign: 'center' }}>{t('visible', 'Visible')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="no-data">
                    {t('nopProductFound', 'No products found.')}
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr
                    key={product._id}
                    onClick={() => navigate(`/admin/products/${product._id}`)}
                    className="table-row"
                  >
                    <td>{product._id}</td>
                    <td className="image-cell">
                      <img
                        src={product.imageUrl?.[0] || 'https://via.placeholder.com/40'}
                        alt={product.title || 'Product'}
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, display: 'block', margin: '0 auto' }}
                      />
                    </td>
                    <td>{product.title || '-'}</td>
                    <td>${product.price || '0.00'}</td>
                    <td style={{ textAlign: 'center' }}>{product.quantity ?? 0}</td>
                    <td style={{ textAlign: 'center' }}>
                      {categoriesMap[product.idCategory] || 'Loading...'}
                    </td>
                    <td>{product.status || '-'}</td>
                    <td style={{ textAlign: 'center', color: !product.isDeleted ? 'green' : 'red' }}>
                      {!product.isDeleted ? 'Visible' : 'Hidden'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (
        search.trim()
          ? (searchTotalPages > 1 && (
              <div
                className="users-pagination"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  margin: '24px 0',
                }}
              >
                <button
                  onClick={() => setSearchPage(searchPage - 1)}
                  disabled={searchPage === 1}
                  style={{
                    fontSize: 20,
                    padding: '4px 12px',
                    cursor: searchPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: searchPage === 1 ? 0.5 : 1,
                    border: 'none',
                    background: 'none',
                  }}
                >
                  &#8592;
                </button>
                <span style={{ fontWeight: 600, fontSize: 18 }}>{searchPage}/{searchTotalPages}</span>
                <button
                  onClick={() => setSearchPage(searchPage + 1)}
                  disabled={searchPage === searchTotalPages}
                  style={{
                    fontSize: 20,
                    padding: '4px 12px',
                    cursor: searchPage === searchTotalPages ? 'not-allowed' : 'pointer',
                    opacity: searchPage === searchTotalPages ? 0.5 : 1,
                    border: 'none',
                    background: 'none',
                  }}
                >
                  &#8594;
                </button>
              </div>
            ))
          : (totalPages > 1 && (
              <div
                className="users-pagination"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  margin: '24px 0',
                }}
              >
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  style={{
                    fontSize: 20,
                    padding: '4px 12px',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    opacity: page === 1 ? 0.5 : 1,
                    border: 'none',
                    background: 'none',
                  }}
                >
                  &#8592;
                </button>
                <span style={{ fontWeight: 600, fontSize: 18 }}>{page}/{totalPages}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  style={{
                    fontSize: 20,
                    padding: '4px 12px',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    opacity: page === totalPages ? 0.5 : 1,
                    border: 'none',
                    background: 'none',
                  }}
                >
                  &#8594;
                </button>
              </div>
            ))
      )}

    </div>
  );
}
