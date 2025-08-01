import { useEffect, useState } from 'react';
import { useAuth } from '../components/context/authcontext';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import { useTranslation } from 'react-i18next';
import './order.css';

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
  const [orders, setOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }};

  useEffect(() => {fetchOrders();}, [selectedTab, user]);

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
    
    console.log("Sending request for orderId:", orderId, apiEndpoint);
    if (!res.ok) throw new Error('Failed to update status');

    setOrders(prev =>
      prev.map(order =>
        order._id === orderId ? { ...order, status: newStatus } : order
      )
    );

    } catch (err) {
    alert(`Error: ${err.message}`);
  }};

const { t } = useTranslation();

return (
<>
  <Navbar />
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

    {loading ? (<div>{t('loading', 'Loading...')}</div>) 
    : error ? ( 
      <div style={{ color: 'red' }}>{error}</div>) 
      : orders.length === 0 ? (
        <div style={{ color: '#888' }}>{t('noOrders', 'No orders found.')}</div>) 
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => {
              const showCancel = ['pending', 'picking'].includes(order.status);
              const showComplete = order.status === 'delivered';
              const showReturn = order.status === 'delivered';

          return (
            <div key={order._id} className="order-card">
              <div className="order-card-actions">
                {showCancel && (
                  <button
                    onClick={() => handleStatusChange(order._id, 'canceled')}
                    style={{ ...actionStyle, backgroundColor: '#f44336' }}
                  >
                    {t('cancel', 'Cancel')}
                  </button>
                )}
                {showComplete && (
                  <button
                    onClick={() => handleStatusChange(order._id, 'completed')}
                    style={{ ...actionStyle, backgroundColor: '#009688' }}
                  >
                    {t('complete', 'Complete')}
                  </button>
                )}
                {showReturn && (
                  <button
                    onClick={() => handleStatusChange(order._id, 'returned')}
                    style={{ ...actionStyle, backgroundColor: '#607d8b' }}
                  >
                    {t('return', 'Return')}
                  </button>
                )}
              </div>

              <div className="order-card-title">{t('orderId', 'Order')}: {order._id}</div>
              <div>{t('status1', 'Status')}: <span style={{ fontWeight: 500 }}>{order.status}</span></div>
              <div>{t('payment', 'Payment')}: <span style={{ fontWeight: 500 }}>{order.paymentMethod}</span></div>
              <div>{t('shippingAddress', 'Shipping Address')}: <span style={{ fontWeight: 500 }}>{order.shippingAddress}</span></div>
              <div>{t('date', 'Date')}: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</div>

              {order.items && order.items.length > 0 && (
                <div className="order-product-list">
                  <div style={{ fontWeight: 500 }}>{t('products', 'Products')}:</div>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {t('productid', 'Product ID')}: {item.productId} | {t('quantity', 'Quantity')}: {item.quantity} | {t('price', 'Price')}: ${item.price}
                      </li>
                    ))}
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
    );}

const actionStyle = {
  padding: '0.5rem 1rem',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginRight: '0.5rem'
};

export default OrderPage;
