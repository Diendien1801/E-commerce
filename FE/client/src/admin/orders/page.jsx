// src/components/admin/OrderManagement.jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './order.css';

const statusTabs = [
  { key: 'all' },
  { key: 'pending' },
  { key: 'picking' },
  { key: 'shipping' },
  { key: 'delivered' },
  { key: 'completed' },
  { key: 'canceled' },
  { key: 'returned' }
];

const LIMIT = 5;

const statusBadgeClass = (status) => {
  const map = {
    pending: 'badge pending',
    picking: 'badge pending',
    shipping: 'badge pending',
    delivered: 'badge done',
    completed: 'badge done',
    canceled: 'badge canceled',
    returned: 'badge canceled'
  };
  return map[status] || 'badge';
};

const OrderRow = ({ order, handleStatusChange, t, expanded, toggleExpand }) => {
  const actionByStatus = {
    pending: { label: 'Approve', api: 'approve', next: 'picking', color: '#4CAF50' },
    picking: { label: 'Ship', api: 'ship', next: 'shipping', color: '#2196F3' },
    shipping: { label: 'Deliver', api: 'deliver', next: 'delivered', color: '#00a58c' },
    delivered: { label: 'Complete', api: 'complete', next: 'completed', color: '#008000' }
  };

  const action = actionByStatus[order.status];
  const canCancel = ['pending', 'picking', 'shipping'].includes(order.status);

  return (
    <>
      <tr>
        <td>
          <div className="id-with-arrow">
            <button 
              className="dropdown-btn"
              style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  color: "#444"
                  }}
              onClick={() => toggleExpand(order._id)}>
              {expanded ? '▼' : '▶'}
            </button>
            <span>{order._id}</span>
          </div>
        </td>
        <td>{order.idUser}</td>
        <td>{order.paymentMethod}</td>
        <td>{order.shippingAddress}</td>
        <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</td>
        <td><span className={statusBadgeClass(order.status)}>{order.status}</span></td>
        <td>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {action && (
              <button className="order-action-btn"
                onClick={() => handleStatusChange(order._id, action.next, action.api)}
                style={{
                  backgroundColor: action.color,
                  color: 'white',
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {action.label}
              </button>
            )}
            {canCancel && (
              <button className="order-action-btn"
                onClick={() => handleStatusChange(order._id, 'canceled', 'cancel')}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </td>
      </tr>

      {expanded && order.items?.length > 0 && (
        <tr className="product-row">
          <td colSpan="7" style={{ padding: 0 }}>
            <table className="product-table-order ">
              <thead>
                <tr>
                  <th>{t('productid', 'Product ID')}</th>
                  <th>{t('quantity', 'Quantity')}</th>
                  <th>{t('price', 'Price')}</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.productId}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price} VND</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrders, setExpandedOrders] = useState([]);
  const { t } = useTranslation();

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');
        let url = '';
        if (searchTerm.trim()) {
          url = `http://localhost:5000/api/orders/search?q=${encodeURIComponent(searchTerm)}&page=${page}&limit=${LIMIT}`;
          if (selectedTab !== 'all') {
            url += `&status=${selectedTab}`;
          }
        } else {
          url = `http://localhost:5000/api/orders${selectedTab !== 'all' ? `/status/${selectedTab}` : ''}?limit=${LIMIT}&page=${page}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        if (!Array.isArray(data.data?.orders)) throw new Error(data.message || 'Unexpected response format');
        setOrders(data.data.orders);
        setTotalPages(data.data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchOrders, 300);
    return () => clearTimeout(debounce);
  }, [selectedTab, page, searchTerm]);

  const handleStatusChange = async (orderId, newStatus, apiEndpoint) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/${apiEndpoint}`, { method: 'PATCH' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update order');
      }
      setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h1 className="page-title">{t('orderManagement', 'Order Management')}</h1>

      <input
        type="text"
        placeholder={t('searchOrderId', 'Search by Order ID')}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setPage(1);
          setSelectedTab('all');
        }}
        className="search-input"
      />

      <div className="order-tabs">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setSelectedTab(tab.key); setPage(1); }}
            className={`order-tab-button ${selectedTab === tab.key ? 'active' : ''}`}
          >
            {t(`status.${tab.key}`, tab.key)}
          </button>
        ))}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : orders.length === 0 ? (
        <div className="no-orders">{t('noOrdersFound', 'No orders found.')}</div>
      ) : (
        <div className="table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>{t('orderId', 'Order ID')}</th>
                <th>{t('userid', 'User ID')}</th>
                <th>{t('payment', 'Payment')}</th>
                <th>{t('shippingAddress', 'Shipping Address')}</th>
                <th>{t('date', 'Date')}</th>
                <th>{t('status1', 'Status')}</th>
                <th>{t('actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <OrderRow
                  key={order._id}
                  order={order}
                  handleStatusChange={handleStatusChange}
                  t={t}
                  expanded={expandedOrders.includes(order._id)}
                  toggleExpand={toggleExpand}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div
          className="orders-pagination"
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
          <span style={{ fontWeight: 600, fontSize: 18 }}>{page}</span>
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
      )}

    </div>
  );
}
