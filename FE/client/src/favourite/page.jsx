import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../components/context/authcontext';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import Breadcrumb from '../components/breadcrumb/page';
import ProductCard from '../components/product-card/card';

function Favourite() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const userId = user?._id || user?.userId || user?.id;
    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/favorite/${userId}`)
      .then(res => res.json())
      .then(data => {
        // Keep the whole favorite object for delete
        const productsArr = Array.isArray(data.data)
          ? data.data.map(item => ({ ...item.productID, favId: item._id }))
          : [];
        setProducts(productsArr);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch favorite products');
        setLoading(false);
      });
  }, [user]);

  const handleEditToggle = () => {
    setEditing((prev) => !prev);
    setHovered(null);
  };

  const handleDelete = async (favId) => {
    const userId = user?._id || user?.userId || user?.id;
    const productObj = products.find(p => p.favId === favId);
    if (!productObj) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/favorite`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userID: userId, productID: productObj._id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) => prev.filter((p) => p.favId !== favId));
      } else {
        alert(data.message || 'Failed to delete favorite');
      }
    } catch {
      alert('Server error');
    }
  };

  return (
    <>
      <Navbar />
      <Breadcrumb />
      <div style={{ maxWidth: '900px', margin: '2.5rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>{t('favouriteProducts', 'Favourite Products')}</h2>
          <button
            className="edit-fav-btn"
            style={{
              padding: '0.38rem 1.1rem',
              background: editing ? '#444' : '#9E3736',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '1rem'
            }}
            onClick={handleEditToggle}
          >
            {editing ? t('editing', 'Editing') : t('edit', 'Edit')}
          </button>
        </div>
        {loading ? (
          <div>{t('loading', 'Loading...')}</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : products.length === 0 ? (
          <div style={{ color: '#888' }}>{t('noFavouriteProducts', 'No favourite products found.')}</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            {products.map(product => (
              <div
                key={product._id}
                style={{ position: 'relative' }}
                onMouseEnter={() => editing && setHovered(product.favId)}
                onMouseLeave={() => editing && setHovered(null)}
              >
                <ProductCard product={product} />
                {editing && hovered === product.favId && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'rgba(0,0,0,0.55)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      zIndex: 2
                    }}
                    onClick={() => handleDelete(product.favId)}
                  >
                    {t('deleteConfirm', 'Delete?')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Favourite;
