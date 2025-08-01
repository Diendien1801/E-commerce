import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../components/navbar/navbar";
import Footer from "../../../components/footer/footer";
import defaultAvatar from "./avatar-default.svg";
import { useTranslation } from 'react-i18next';
import "./detail.css";

function UserDetail() {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
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

  return (
    <div>
      <Navbar />
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
            <h2 style={{ marginBottom: "1.5rem", fontWeight: 600 }}>
              {t('userDetails', 'User Details')}
            </h2>

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
                    top: 10,
                    right: 10,
                    backgroundColor: "#ff4d4f",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background-color 0.3s",
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

            <h3 style={{ marginTop: "2rem" }}>Order Statistics</h3>
            <ul style={{ paddingLeft: "1.2rem" }}>
              <li>
                <strong>{t('totalOrder', 'Total Orders')}:</strong> {orderStats.totalOrders}
              </li>
              <li>
                <strong>{t('pending', 'Pending')}:</strong> {orderStats.pendingOrders}
              </li>
              <li>
                <strong>{t('completed', 'Completed')}:</strong> {orderStats.completedOrders}
              </li>
              <li>
                <strong>{t('canceled', 'Canceled')}:</strong> {orderStats.canceledOrders}
              </li>
              <li>
                <strong>{t('totalSpent', 'Total Spent')}:</strong> $
                {orderStats.totalSpent?.toFixed(2)}
              </li>
            </ul>

            <h3 style={{ marginTop: "2rem" }}>{t('orderList', 'Order List')}</h3>
            {orders.length === 0 ? (
              <div style={{ color: "#888" }}>{t('noOrdersFound', 'No orders found.')}</div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {orders.map((order) => (
                  <div
                    key={order._id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: "8px",
                      padding: "1rem",
                      background: "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {t('orderId', 'Order')}: {order._id}
                    </div>
                    <div>
                      {t('status1', 'Status')}:{" "}
                      <span style={{ fontWeight: 500 }}>{order.status}</span>
                    </div>
                    <div>
                      {t('payment', 'Payment')}:{" "}
                      <span style={{ fontWeight: 500 }}>
                        {order.paymentMethod}
                      </span>
                    </div>
                    <div>
                      {t('shippingAddress', 'Shipping Address')}: <span style={{ fontWeight: 500 }}>{order.shippingAddress}</span>
                    </div>
                    <div>
                      {t('date', 'Date')}: {new Date(order.createdAt).toLocaleString()}
                    </div>
                    {order.items?.length > 0 && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <div style={{ fontWeight: 500 }}>{t('products', 'Products')}:</div>
                        <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                          {order.items.map((item, idx) => (
                            <li key={idx}>
                              {t('productid', 'Product ID')}: {item.productID} | {t('quantity', 'Quantity')}:{" "}
                              {item.quantity} | {t('price', 'Price')}: ${item.price}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default UserDetail;
