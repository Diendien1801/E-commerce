import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../components/navbar/navbar";
import Footer from "../../../components/footer/footer";
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


function UserDetail() {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [error, setError] = useState("");
  const [userDetail, setUserDetail] = useState({
    userInfo: {},
    orders: [],
    orderStats: {},
  });

  useEffect(() => {
    async function fetchUserDetail() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/userManagement/${userId}/details`
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
                        `http://localhost:5000/api/userManagement/${userId}/restore`,
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
                        `http://localhost:5000/api/userManagement/${userId}/soft-delete`,
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
                    <td>${orderStats.totalSpent?.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

            <h3 style={{ marginTop: "2rem", marginBottom: "1rem"}}><strong>{t('orderList', 'Order List')}</strong></h3>
              {orders.length === 0 ? (
                <div className="no-orders">{t('noOrdersFound', 'No orders found.')}</div>
              ) : (
                <div className="table-wrapper">
                  <table className="orders-table">
                <thead>
                  <tr>
                    <th>{t('orderId', 'Order ID')}</th>
                    <th>{t('status1', 'Status')}</th>
                    <th>{t('payment', 'Payment')}</th>
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
                                color: "#444"
                              }}
                            >
                              {isExpanded ? "▼" : "▶"}
                            </button>
                            {order._id}</td>
                          <td>
                            <span className={statusBadgeClass(order.status)}>
                              {order.status}
                            </span>
                          </td>
                          <td>{order.paymentMethod}
                            </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan="4">
                              {order.items?.length > 0 ? (
                                <table className="product-table-order">
                                  <thead>
                                    <tr>
                                      <th>{t('productid', 'Product ID')}</th>
                                      <th style={{ textAlign: "center" }}>{t('quantity', 'Quantity')}</th>
                                      <th style={{ textAlign: "center" }}>{t('price', 'Price')}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items.map((item, idx) => (
                                      <tr key={idx}>
                                        <td>{item.productID}</td>
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
              )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserDetail;
