import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 5;

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchProducts = async (pageNumber) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/products/filter-paginated?page=${pageNumber}&limit=${PAGE_SIZE}`);
            const data = await res.json();
            console.log('Fetched products:', data);

            if (data.data && Array.isArray(data.data.products)) {
            const { products, limit, page, total } = data.data;
            setProducts(products);
            setFiltered(products);
            setTotalPages(Math.ceil(total / limit));
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

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  useEffect(() => {
    const s = search.trim().toLowerCase();
    if (!s) {
      setFiltered(products);
    } else {
      setFiltered(
        products.filter(
          p =>
            (p.title && p.title.toLowerCase().includes(s)) ||
            (p._id && p._id.toLowerCase().includes(s))
        )
      );
    }
  }, [search, products]);

  return (
    <>
      <Navbar />
        <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 600 }}>Product Management</h2>
                <button
                    onClick={() => navigate('/admin/create-product')}
                    style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: 500,
                    }}
                >
                    + Add Product
                </button>
            </div>


        <input
          type="text"
          placeholder="Search by title or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            marginBottom: '1.5rem',
            border: '1px solid #ccc',
            borderRadius: 6,
            fontSize: '1rem',
          }}
        />

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Image</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Price</th>
                  <th style={thStyle}>Quantity</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: '#888' }}>
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr
                      key={product._id}
                      onClick={() => navigate(`/admin/products/${product._id}`)}
                      style={rowStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                    >
                      <td style={tdStyle}>{product._id}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <img
                          src={product.imageUrl?.[0] || 'https://via.placeholder.com/40'}
                          alt={product.title || 'Product'}
                          style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}
                        />
                      </td>
                      <td style={tdStyle}>{product.title || '-'}</td>
                      <td style={tdStyle}>${product.price || '0.00'}</td>
                      <td style={{padding: '0.7rem', border: '1px solid #eee', fontFamily: 'monospace', textAlign: 'center'}}>{product.quantity ?? 0}</td>
                      <td style={tdStyle}>{product.status || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div
          className="products-pagination"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            margin: '24px 0',
          }}
        >
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            style={paginationBtnStyle(page === 1)}
          >
            &#8592;
          </button>
          <span style={{ fontWeight: 600, fontSize: 18 }}>{page}</span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page === totalPages}
            style={paginationBtnStyle(page === totalPages)}
          >
            &#8594;
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}

const thStyle = {
  padding: '0.7rem',
  border: '1px solid #eee',
  textAlign: 'left',
};

const tdStyle = {
  padding: '0.7rem',
  border: '1px solid #eee',
  fontFamily: 'monospace',
};

const rowStyle = {
  cursor: 'pointer',
  backgroundColor: '#fff',
  transition: 'background 0.2s',
};

const paginationBtnStyle = (disabled) => ({
  fontSize: 20,
  padding: '4px 12px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  border: 'none',
  background: 'none',
  outline: 'none',
  boxShadow: 'none',
});

export default ProductManagement;
