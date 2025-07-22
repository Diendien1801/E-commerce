import { useEffect, useState } from 'react';
import { useAuth } from '../components/context/authcontext';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';

function OrderPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !user._id) {
      setError('User not logged in');
      setLoading(false);
      return;
    }
    fetch(`http://localhost:5000/api/user/${user._id}`)
      .then(res => res.json())
      .then(data => {
        const ordersArr = Array.isArray(data?.data?.orders) ? data.data.orders : [];
        setOrders(ordersArr);
        setLoading(false);
        console.log('Fetched orders:', ordersArr);
      })
      .catch(() => {
        setError('Failed to fetch orders');
        setLoading(false);
      });
  }, [user]);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '2.5rem auto', padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Order History</h2>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : orders.length === 0 ? (
          <div style={{ color: '#888' }}>No orders found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => (
              <div key={order._id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', background: '#fafafa' }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Order: {order.idOrder}</div>
                <div>Status: <span style={{ fontWeight: 500 }}>{order.status}</span></div>
                <div>Payment: <span style={{ fontWeight: 500 }}>{order.paymentMethod}</span></div>
                <div>Shipping Address: <span style={{ fontWeight: 500 }}>{order.shippingAddress}</span></div>
                <div>Date: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</div>
                {order.items && order.items.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ fontWeight: 500 }}>Products:</div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          Product ID: {item.productID} | Quantity: {item.quantity} | Price: ${item.price}
                        </li>
                      ))}
                    </ul>
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

export default OrderPage;
