  // Add fetchOrdersPage for default orders pagination
  const fetchOrdersPage = (pageNum) => {
    setPage(pageNum);
  };
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import defaultAvatar from "./avatar-default.svg";
import { useTranslation } from 'react-i18next';
import "./detail.css";
import "../../orders/order.css";

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

function UserDetail() {
  const [orderSearch, setOrderSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchTimer, setSearchTimer] = useState(null);
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [error, setError] = useState("");
  const [selectedTab, setSelectedTab] = useState('all'); 
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productDetailsMap, setProductDetailsMap] = useState({});

  const [userDetail, setUserDetail] = useState({
    userInfo: {},
    orders: [],
    orderStats: {},
  });

  useEffect(() => {
  const fetchOrdersByTab = async () => {
      try {
        setLoading(true);
        setError('');
        let url = `${process.env.REACT_APP_BACKEND_URL}/api/orders/user/${userId}?limit=5&page=${page}`;
        if (selectedTab !== 'all') url += `&status=${selectedTab}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log("Fetched orders:", data);

        if (!data.success || !data.data) throw new Error(data.message || 'Failed to fetch filtered orders');

        setUserDetail(prev => ({
          ...prev,
          orders: data.data.orders,
        }));
        setTotalPages(data.data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.message || 'Error fetching filtered orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersByTab();
  }, [selectedTab, page, userId]);

  useEffect(() => {
    async function fetchUserDetail() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/userManagement/${userId}/details`
        );
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch user data");
        }

        setUserDetail(data.data);
        console.log("User detail fetched:", data.data.userInfo);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error fetching user data");
      } finally {
        setLoading(false);
      }
    }

    fetchUserDetail();
  }, [userId]);

  const { userInfo, orders, orderStats } = userDetail;

  const { t } = useTranslation();

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const fetchProductDetails = async (productId) => {
    if (productDetailsMap[productId]) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products/admin/${productId}`);
      const data = await res.json();
      console.log(`Fetched product ${productId}:`, data);

      if (data.success && data.data) {
        setProductDetailsMap(prev => ({
          ...prev,
          [productId]: {
            id: productId,
            name: data.data.title,
            image: data.data.imageUrl,
          }
        }));
      }
    } catch (err) {
      console.error(`Failed to fetch product ${productId}`, err);
    }
  };

  useEffect(() => {
    const uniqueProductIds = new Set();
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (item.productID) uniqueProductIds.add(item.productID);
      });
    });

    uniqueProductIds.forEach(id => fetchProductDetails(id));
  }, [orders]);

  const fetchSearchPage = async (pageNum) => {
    setSearchLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/o/user/${userId}/search?q=${encodeURIComponent(orderSearch.trim())}&page=${pageNum}&limit=5`);
      const data = await res.json();
      if (!data.success || !Array.isArray(data.data)) throw new Error(data.message || 'Order not found');
      setSearchResults(data.data);
      setSearchTotalPages(data.meta?.pages || 1);
    } catch (err) {
      setSearchError(err.message || 'Order not found');
      setSearchResults([]);
      setSearchTotalPages(1);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div>
      <div style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div
            style={{
              padding: "2rem",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#d8000c" }}>User Not Found</h2>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <h1 className="page-title">
              {t('userDetails', 'User Details')}
            </h1>

            <div className="user-card" style={{ position: "relative" }}>
              {userInfo.isDeleted ? (
                <button
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    backgroundColor: "#52c41a",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#389e0d";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#52c41a";
                  }}
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `${process.env.REACT_APP_BACKEND_URL}/api/userManagement/${userId}/restore`,
                        { method: "PATCH" }
                      );

                      if (!response.ok) {
                        throw new Error("Failed to restore user.");
                      }

                      alert("User restored successfully.");

                      setUserDetail((prev) => ({
                        ...prev,
                        userInfo: { ...prev.userInfo, isDeleted: false },
                      }));
                    } catch (error) {
                      alert("Error restoring user: " + error.message);
                    }
                  }}
                >
                  {t('restore', 'Restore')}
                </button>
                ) : (
                <button
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    backgroundColor: "#ff4d4f",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                    fontSize: "14px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#d9363e";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ff4d4f";
                  }}
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `${process.env.REACT_APP_BACKEND_URL}/api/userManagement/${userId}/soft-delete`,
                        {
                          method: "DELETE",
                        }
                      );

                      if (!response.ok) {
                        throw new Error("Failed to delete user.");
                      }

                      alert("User soft-deleted successfully.");

                      setUserDetail((prev) => ({
                        ...prev,
                        userInfo: { ...prev.userInfo, isDeleted: true },
                      }));
                    } catch (error) {
                      alert("Error deleting user: " + error.message);
                    }
                  }}
                >
                  {t('delete', 'Delete')}
                </button>
              )}

              <div className="user-card-avatar">
                <img
                  src={userInfo.avatar || defaultAvatar}
                  alt={`${userInfo.name|| "User"}'s avatar`}
                />
              </div>
              <div className="user-card-details">
                <h3>{userInfo.name || "N/A"}</h3>
                <p>
                  <strong>{t('id', 'ID')}:</strong> {userInfo._id}
                </p>
                <p>
                  <strong>{t('email', 'Email')}:</strong> {userInfo.email}
                </p>
                <p>
                  <strong>{t('address', 'Address')}:</strong>{" "}
                  {userInfo.address?.country || "N/A"}
                </p>
                <p>
                  <strong>{t('phoneNumber', 'Phone number')}:</strong>{" "}
                  {userInfo.phoneNumber || "N/A"}
                </p>
                <p>
                  <strong>{t('register', 'Registered')}:</strong>{" "}
                  {new Date(userInfo.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <h3 style={{ marginTop: "2rem", marginBottom: "1rem"}}><strong>Order Statistics</strong></h3>
              <table className="order-stats-table">
                <thead>
                  <tr>
                    <th>{t('totalOrder', 'Total Orders')}</th>
                    <th>{t('pending', 'Pending')}</th>
                    <th>{t('completed', 'Completed')}</th>
                    <th>{t('canceled', 'Canceled')}</th>
                    <th>{t('totalSpent', 'Total Spent')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{orderStats.totalOrders}</td>
                    <td><span className="status-badge pending">{orderStats.pendingOrders}</span></td>
                    <td><span className="status-badge completed">{orderStats.completedOrders}</span></td>
                    <td><span className="status-badge canceled">{orderStats.canceledOrders}</span></td>
                    <td>{orderStats.totalSpent ? orderStats.totalSpent.toLocaleString('vi-VN') : 0} VND</td>
                  </tr> 
                </tbody>
              </table>

            <h3 style={{ marginTop: "2rem", marginBottom: "1rem"}}><strong>{t('orderList', 'Order List')}</strong></h3>

            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                placeholder={t('searchOrderId', 'Search by Order ID')}
                value={orderSearch}
                onChange={e => {
                  setOrderSearch(e.target.value);
                  setSearchError("");
                  setSearchResults([]);
                  setSearchPage(1);
                  if (searchTimer) clearTimeout(searchTimer);
                  const value = e.target.value.trim();
                  if (!value) {
                    setSearchLoading(false);
                    setSearchResults([]);
                    setSearchTotalPages(1);
                    return;
                  }
                  setSearchLoading(true);
                  setSearchTimer(setTimeout(async () => {
                    try {
                      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/user/${userId}/search?q=${encodeURIComponent(value)}&page=1&limit=5`);
                      const data = await res.json();
                      if (!data.success || !Array.isArray(data.data)) throw new Error(data.message || 'Order not found');
                      setSearchResults(data.data);
                      setSearchTotalPages(data.meta?.pages || 1);
                    } catch (err) {
                      setSearchError(err.message || 'Order not found');
                      setSearchResults([]);
                      setSearchTotalPages(1);
                    } finally {
                      setSearchLoading(false);
                    }
                  }, 400));
                }}
                className="search-input"
                style={{ width: '100%', maxWidth: '100%', marginRight: 0, boxSizing: 'border-box' }}
              />
              {searchLoading && <span style={{ marginLeft: 8 }}>Searching...</span>}
              {searchError && <span style={{ color: '#d8000c', marginLeft: 8 }}>{searchError}</span>}
            </div>

            <div className="order-tabs" style={{ marginBottom: "1rem" }}>
              {statusTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setSelectedTab(tab.key);
                    setPage(1);
                  }}
                  className={`order-tab-button ${selectedTab === tab.key ? 'active' : ''}`}
                >
                  {t(`status.${tab.key}`, tab.key)}
                </button>
              ))}
            </div>

            {/* Only render one table: search results if available, else default orders */}
            {searchResults.length > 0 ? (
              <>
                <div className="table-wrapper">
                  <table className="order-table">
                    <thead style={{ background: '#f0f0f0' }}>
                      <tr>
                        <th>{t('orderId', 'Order ID')}</th>
                        <th>{t('shippingAddress', 'Shipping Address')}</th>
                        <th>{t('status1', 'Status')}</th>
                        <th>{t('payment', 'Payment')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((searchResult) => {
                        const isExpanded = expandedOrders.includes(searchResult._id);
                        return (
                          <React.Fragment key={searchResult._id}>
                            <tr>
                              <td>
                                <button
                                  onClick={() => toggleOrder(searchResult._id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "1rem",
                                    color: "#444",
                                    marginRight: "0.5rem"
                                  }}
                                >
                                  {isExpanded ? "▼" : "▶"}
                                </button>
                                {searchResult.idOrder}
                              </td>
                              <td>{searchResult.shippingAddress}</td>
                              <td><span className={statusBadgeClass(searchResult.status)}>{searchResult.status}</span></td>
                              <td>{searchResult.paymentMethod}</td>
                            </tr>
                            {isExpanded && searchResult.items?.length > 0 && (
                              <tr>
                                <td colSpan="5">
                                  <table className="product-table-order">
                                    <thead>
                                      <tr>
                                        <th>{t('productid', 'Product ID')}</th>
                                        <th>{t('productname', 'Product Name')}</th>
                                        <th style={{ textAlign: "center" }}>{t('image', 'Image')}</th>
                                        <th style={{ textAlign: "center" }}>{t('quantity', 'Quantity')}</th>
                                        <th style={{ textAlign: "center" }}>{t('price', 'Price')}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {searchResult.items.map((item, idx2) => (
                                        <tr key={idx2}>
                                          <td>{item.productID}</td>
                                          <td>{productDetailsMap[item.productID]?.name || item.productID}</td>
                                          <td style={{ textAlign: "center" }}>
                                            {productDetailsMap[item.productID]?.image && (
                                              <img
                                                src={productDetailsMap[item.productID].image}
                                                alt={productDetailsMap[item.productID].name || item.productID}
                                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, display: 'block', margin: '0 auto' }}
                                              />
                                            )}
                                          </td>
                                          <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                          <td style={{ textAlign: "center" }}>{item.price} VND</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {searchTotalPages > 1 && (
                  <div className="orders-pagination" style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '16px 0' }}>
                    <button onClick={() => {
                      if (searchPage > 1) {
                        setSearchPage(searchPage - 1);
                        fetchSearchPage(searchPage - 1);
                      }
                    }} disabled={searchPage === 1}>&larr;</button>
                    <span style={{ fontWeight: 600 }}>{searchPage}/{searchTotalPages}</span>
                    <button onClick={() => {
                      if (searchPage < searchTotalPages) {
                        setSearchPage(searchPage + 1);
                        fetchSearchPage(searchPage + 1);
                      }
                    }} disabled={searchPage === searchTotalPages}>&rarr;</button>
                  </div>
                )}
              </>
            ) : (
              orders.length === 0 ? (
                <div className="no-orders">{t('noOrdersFound', 'No orders found.')}</div>
              ) : (
                <>
                  <div className="table-wrapper">
                    <table className="order-table">
                      <thead style={{ background: '#f0f0f0' }}>
                        <tr>
                          <th>{t('orderId', 'Order ID')}</th>
                          <th>{t('address', 'Address')}</th>
                          <th style={{ textAlign: "center" }}>{t('status1', 'Status')}</th>
                          <th style={{ textAlign: "center" }}>{t('payment', 'Payment')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => {
                          const isExpanded = expandedOrders.includes(order._id);
                          return (
                            <React.Fragment key={order._id}>
                              <tr>
                                <td>
                                  <button
                                    onClick={() => toggleOrder(order._id)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      fontSize: "1rem",
                                      color: "#444",
                                      marginRight: "0.5rem"
                                    }}
                                  >
                                    {isExpanded ? "▼" : "▶"}
                                  </button>
                                  {order.idOrder}</td>
                                <td>{order.shippingAddress}</td>
                                <td style={{ textAlign: "center" }}>
                                  <span className={statusBadgeClass(order.status)}>
                                    {order.status}
                                  </span>
                                </td>
                                <td style={{ textAlign: "center" }}>{order.paymentMethod}</td>
                              </tr>

                              {isExpanded && (
                                <tr>
                                  <td colSpan="4">
                                    {order.items?.length > 0 ? (
                                      <table className="product-table-order">
                                        <thead>
                                          <tr>
                                            <th>{t('productid', 'Product ID')}</th>
                                            <th>{t('productname', 'Product Name')}</th>
                                            <th style={{ textAlign: "center" }}>{t('image', 'Image')}</th>
                                            <th style={{ textAlign: "center" }}>{t('quantity', 'Quantity')}</th>
                                            <th style={{ textAlign: "center" }}>{t('price', 'Price')}</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {order.items.map((item, idx) => (
                                            <tr key={idx}>
                                              <td style={{ textAlign: "center" }}>{item.productID}</td>
                                              <td>{productDetailsMap[item.productID]?.name || item.productID}</td>
                                              <td style={{ textAlign: "center" }}>
                                                  {productDetailsMap[item.productID]?.image && (
                                                    <img
                                                      src={productDetailsMap[item.productID].image}
                                                      alt={productDetailsMap[item.productID].name || item.productID}
                                                      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, display: 'block', margin: '0 auto' }}
                                                    />
                                                  )}
                                              </td>
                                              <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                              <td style={{ textAlign: "center" }}>{item.price} VND</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    ) : (
                                      <span style={{ color: "#888" }}>{t('noProducts', 'No products')}</span>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className="orders-pagination" style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '16px 0' }}>
                      <button onClick={() => setPage(page - 1)} disabled={page === 1}>&larr;</button>
                      <span style={{ fontWeight: 600 }}>{page}/{totalPages}</span>
                      <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>&rarr;</button>
                    </div>
                  )}
                  
                    {searchTotalPages > 1 && (
                    <div className="orders-pagination" style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '8px 0' }}>
                      <button onClick={() => {
                        if (searchPage > 1) {
                          setSearchPage(searchPage - 1);
                          fetchSearchPage(searchPage - 1);
                        }
                      }} disabled={searchPage === 1}>&larr;</button>
                      <span style={{ fontWeight: 600 }}>{searchPage}/{searchTotalPages}</span>
                      <button onClick={() => {
                        if (searchPage < searchTotalPages) {
                          setSearchPage(searchPage + 1);
                          fetchSearchPage(searchPage + 1);
                        }
                      }} disabled={searchPage === searchTotalPages}>&rarr;</button>
                    </div>
                  )}
                </>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserDetail;
