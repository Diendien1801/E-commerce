import { useEffect, useState } from 'react';
import { useAuth } from '../components/context/authcontext';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import { useTranslation } from 'react-i18next';
import './order.css';
import Breadcrumb  from '../components/breadcrumb/page';
import { useNavigate } from 'react-router-dom';
const statusTabs = [
  { key: 'all'},
  { key: 'pending' },
  { key: 'picking'},
  { key: 'shipping'},
  { key: 'delivered' },
  { key: 'completed' },
  { key: 'canceled' },
  { key: 'returned' }
];

function OrderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productDetails, setProductDetails] = useState({}); // { [productId]: { loading, data, error } }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };
  const fetchOrders = async () => {
    if (!user || !user._id) {
      setError('User not logged in');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const baseUrl = `http://localhost:5000/api/orders/user/${user._id}`;
      const statusQuery = selectedTab !== 'all' ? `status=${selectedTab}&` : '';
      const page = 1;
      const limit = 100;
      const url = `${baseUrl}?${statusQuery}page=${page}&limit=${limit}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!Array.isArray(data.data?.orders)) throw new Error(data.message || 'Unexpected response');
      setOrders(data.data.orders);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {fetchOrders();}, [selectedTab, user]);

  // Fetch product details for all products in all orders
  useEffect(() => {
    const productIds = new Set();
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (item.productID && !productDetails[item.productID]) {
          productIds.add(item.productID);
        }
      });
    });
    productIds.forEach(productId => {
      setProductDetails(prev => ({
        ...prev,
        [productId]: { loading: true, data: null, error: null }
      }));
      fetch(`http://localhost:5000/api/products/${productId}`)
        .then(res => res.json())
        .then(data => {
          setProductDetails(prev => ({
            ...prev,
            [productId]: { loading: false, data: data.data, error: null }
          }));
        })
        .catch(err => {
          setProductDetails(prev => ({
            ...prev,
            [productId]: { loading: false, data: null, error: err.message }
          }));
        });
    });
  }, [orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    const endpointMap = {
      canceled: 'cancel', returned: 'return', completed: 'complete'
    };
    const apiEndpoint = endpointMap[newStatus];
    if (!apiEndpoint) return;
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/${apiEndpoint}`, {
        method: 'PATCH'
      });
      if (!res.ok) throw new Error('Failed to update status');
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <Breadcrumb/>
      <div className="order-manage-container">
        <h2 className="order-header">{t('myOrders', 'My Orders')}</h2>
        <div className="order-tabs">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`order-tab-button ${selectedTab === tab.key ? 'active' : ''}`}
            >
              {t(`status.${tab.key}`, tab.key)}
            </button>
          ))}
        </div>
        {loading ? (
          <div>{t('loading', 'Loading...')}</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : orders.length === 0 ? (
          <div style={{ color: '#888' }}>{t('noOrders', 'No orders found.')}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => {
              const showCancel = ['pending', 'picking'].includes(order.status);
              const showComplete = order.status === 'delivered';
              const showReturn = order.status === 'delivered';
              return (
                <div key={order._id} className={`order-card status-${order.status}`}>
                  <div className="order-card-actions">
                    {showCancel && (
                      <button
                        onClick={() => handleStatusChange(order._id, 'canceled')}
                        style={{ ...actionStyle, backgroundColor: '#eee', color: '#333' }}
                      >
                        {t('cancel', 'Cancel')}
                      </button>
                    )}
                    {showComplete && (
                      <button
                        onClick={() => handleStatusChange(order._id, 'completed')}
                        style={{ ...actionStyle, backgroundColor: '#eee', color: '#333' }}
                      >
                        {t('complete', 'Complete')}
                      </button>
                    )}
                    {showReturn && (
                      <button
                        onClick={() => handleStatusChange(order._id, 'returned')}
                        style={{ ...actionStyle, backgroundColor: '#eee', color: '#333' }}
                      >
                        {t('return', 'Return')}
                      </button>
                    )}
                  </div>
                  <div className="order-card-title">
                    {t('orderId', 'Order')}: {order._id}
                  </div>
                  <div>{t('status1', 'Status')}: <span style={{ fontWeight: 500 }}>{order.status}</span></div>
                  <div>{t('payment', 'Payment')}: <span style={{ fontWeight: 500 }}>{order.paymentMethod}</span></div>
                  <div>{t('shippingAddress', 'Shipping Address')}: <span style={{ fontWeight: 500 }}>{order.shippingAddress}</span></div>
                  <div>{t('date', 'Date')}: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</div>
                  {order.items && order.items.length > 0 && (
                    <div className="order-product-list">
                      <div style={{ fontWeight: 500 }}>{t('products', 'Products')}:</div>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {order.items.map((item, idx) => {
                          const product = productDetails[item.productID];
                          return (
                            <li key={idx}>
                              {product?.loading ? (
                                <div style={{ color: '#aaa' }}>{t('loading', 'Loading product...')}</div>
                              ) : product?.error ? (
                                <div style={{ color: 'red' }}>{t('error', 'Error')}: {product.error}</div>
                              ) : product?.data ? (
                                <>

                                  <div className="product-card-clickable"
                                    onClick={() => navigate(`../view-product/${product.data._id}`)}
                                    style={{ display: 'flex', cursor: 'pointer', gap: '1rem', alignItems: 'flex-start' }}
                                  >
                                    {product.data.imageUrl && product.data.imageUrl[0] && (
                                      <img src={product.data.imageUrl[0]} alt={product.data.title} />
                                    )}
                                    <div className="product-info">
                                      <div className="product-title">{product.data.title}</div>
                                      <div className="product-desc">{product.data.description?.split('\n')[0]}</div>
                                      <div className="product-meta">
                                        {t('productid', 'Product ID')}: {item.productID}<br/>
                                        {t('quantity', 'Quantity')}: {item.quantity} &nbsp;|&nbsp; {t('price', 'Price')}: ${item.price}
                                      </div>

                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div style={{ color: '#aaa' }}>{t('noData', 'No product data')}</div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

const actionStyle = {
  padding: '0.5rem 1rem',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginRight: '0.5rem',
  backgroundColor: '#eee',
};

export default OrderPage;
