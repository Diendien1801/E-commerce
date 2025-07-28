import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../components/navbar/navbar";
import Footer from "../../../components/footer/footer";
import defaultAvatar from "./avatar-default.svg";
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

        if (data.data.userInfo?.isDeleted) {
          setError("User not found or has been deleted.");
          return;
        }

        setUserDetail(data.data);
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
              User Details
            </h2>

            <div className="user-card" style={{ position: "relative" }}>
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
                    setError("User not found or has been deleted."); // Optional: refresh view
                  } catch (error) {
                    alert("Error deleting user: " + error.message);
                  }
                }}
              >
                Delete
              </button>
              <div className="user-card-avatar">
                <img
                  src={userInfo.avatar || defaultAvatar}
                  alt={`${userInfo.fullName || "User"}'s avatar`}
                />
              </div>
              <div className="user-card-details">
                <h3>{userInfo.fullName || "N/A"}</h3>
                <p>
                  <strong>Email:</strong> {userInfo.email}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {userInfo.address?.country || "N/A"}
                </p>
                <p>
                  <strong>Registered:</strong>{" "}
                  {new Date(userInfo.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <h3 style={{ marginTop: "2rem" }}>Order Statistics</h3>
            <ul style={{ paddingLeft: "1.2rem" }}>
              <li>
                <strong>Total Orders:</strong> {orderStats.totalOrders}
              </li>
              <li>
                <strong>Pending:</strong> {orderStats.pendingOrders}
              </li>
              <li>
                <strong>Completed:</strong> {orderStats.completedOrders}
              </li>
              <li>
                <strong>Canceled:</strong> {orderStats.canceledOrders}
              </li>
              <li>
                <strong>Total Spent:</strong> $
                {orderStats.totalSpent?.toFixed(2)}
              </li>
            </ul>

            <h3 style={{ marginTop: "2rem" }}>Order List</h3>
            {orders.length === 0 ? (
              <div style={{ color: "#888" }}>No orders found.</div>
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
                      Order: {order.idOrder}
                    </div>
                    <div>
                      Status:{" "}
                      <span style={{ fontWeight: 500 }}>{order.status}</span>
                    </div>
                    <div>
                      Payment:{" "}
                      <span style={{ fontWeight: 500 }}>
                        {order.paymentMethod}
                      </span>
                    </div>
                    <div>
                      Items: <strong>{order.totalItems}</strong> | Total:{" "}
                      <strong>${order.totalAmount.toFixed(2)}</strong>
                    </div>
                    <div>
                      Created: {new Date(order.createdAt).toLocaleString()}
                    </div>
                    {order.items?.length > 0 && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <div style={{ fontWeight: 500 }}>Products:</div>
                        <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                          {order.items.map((item, idx) => (
                            <li key={idx}>
                              Product ID: {item.productID} | Quantity:{" "}
                              {item.quantity} | Price: ${item.price}
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
