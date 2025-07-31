import { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import './order.css'; 

const statusTabs = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'picking', label: 'Picking' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
  { key: 'canceled', label: 'Canceled' },
  { key: 'returned', label: 'Returned' }
];

const LIMIT = 5;

const OrderManage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');


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

        if (!Array.isArray(data.data?.orders)) {
          throw new Error(data.message || 'Unexpected response format');
        }

        setOrders(data.data.orders);
        setTotalPages(data.data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
    }};

    const debounce = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(debounce);
  }, [selectedTab, page, searchTerm]);


  const handleStatusChange = async (orderId, newStatus, apiEndpoint) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/${apiEndpoint}`, {
        method: 'PATCH'
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update order');
      }

      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleTabChange = (key) => {
    setSelectedTab(key);
    setPage(1);
  };

  return (
    <div>
      <Navbar />
      <div className="order-manage-container">
        <h2 className="order-header">Order Management</h2>

        <input
          type="text"
          placeholder="Search by Order ID"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
            setSelectedTab('all'); 
          }}
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            marginBottom: '1rem',
            fontSize: '1rem',
            border: '1px solid #ccc',
            borderRadius: 6
          }}
        />
        <div className="order-tabs">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`order-tab-button ${selectedTab === tab.key ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : orders.length === 0 ? (
          <div style={{ color: '#888' }}>No orders found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => {
              const actionByStatus = {
                pending: { label: 'Approve', api: 'approve', next: 'picking', color: '#4CAF50' },
                picking: { label: 'Ship', api: 'ship', next: 'shipping', color: '#2196F3' },
                shipping: { label: 'Deliver', api: 'deliver', next: 'delivered', color: '#673AB7' },
                delivered: { label: 'Complete', api: 'complete', next: 'completed', color: '#009688' }
              };

              const action = actionByStatus[order.status];
              const canCancel = ['pending', 'picking', 'shipping'].includes(order.status);

              return (
                <div key={order._id} className="order-card">
                  <div className="order-card-actions">
                    {action && (
                      <button
                        onClick={() =>
                          handleStatusChange(order._id, action.next, action.api)
                        }
                        style={{
                          ...actionStyle,
                          backgroundColor: action.color
                        }}
                      >
                        {action.label}
                      </button>
                    )}

                    {canCancel && (
                      <button
                        onClick={() => handleStatusChange(order._id, 'canceled', 'cancel')}
                        style={{
                          ...actionStyle,
                          backgroundColor: '#f44336'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="order-card-title">Order: {order._id}</div>
                  <div>User ID: <span style={{ fontWeight: 500 }}>{order.idUser}</span></div>
                  <div>Status: <span style={{ fontWeight: 500 }}>{order.status}</span></div>
                  <div>Payment: <span style={{ fontWeight: 500 }}>{order.paymentMethod}</span></div>
                  <div>Shipping Address: <span style={{ fontWeight: 500 }}>{order.shippingAddress}</span></div>
                  <div>Date: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</div>

                  {order.items && order.items.length > 0 && (
                    <div className="order-product-list">
                      <div style={{ fontWeight: 500 }}>Products:</div>
                      <ul>
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            Product ID: {item.productID} | Quantity: {item.quantity} | Price: ${item.price}
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

        {!loading && totalPages > 1 && (
          <div className="products-pagination">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="pagination-button"
            >
              &#8592;
            </button>
            <span style={{ fontWeight: 600, fontSize: 18 }}>{page}</span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="pagination-button"
            >
              &#8594;
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

const actionStyle = {
  padding: '0.5rem 1rem',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

export default OrderManage;
