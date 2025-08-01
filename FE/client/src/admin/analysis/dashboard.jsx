import OrderStatus from './chart/order/OrderStatus';
import ProductCategory from './chart/product/StackBar';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import TopSale from './chart/product/TopSale';
import TopStock from './chart/product/TopStock';
import RevenueByMonth from './chart/revenue/RevenueChart';
import UserRegistration from './chart/user/UserChart';
import { useState } from 'react';
import './dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Products');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="dashboard-container">
        <h1 className="dashboard-header">Admin Dashboard</h1>

        <div className="dashboard-tabs">
          {['Products', 'Orders', 'Users', 'Revenue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`dashboard-tab-button ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeTab === 'Products' && (
            <>
              <div className="dashboard-card">
                <h2>Products by Categories</h2>
                <ProductCategory />
              </div>

              <div className="dashboard-card">
                <h2>Top stocked products</h2>
                <div className="top-stock-scroll">
                <TopStock />
                </div>
              </div>

              <div className="dashboard-card">
                <h2>Best sellers</h2>
                <div className="top-stock-scroll">
                <TopSale />
                </div>
              </div>
            </>
          )}

          {activeTab === 'Orders' && (
            <div className="dashboard-card col-span-2">
              <h2>Orders by Status</h2>
              <OrderStatus />
            </div>
          )}

          {activeTab === 'Revenue' && (
            <div className="dashboard-card col-span-2">
              <h2>Revenue by Month</h2>
              <RevenueByMonth />
            </div>
          )}

          {activeTab === 'Users' && (
            <div className="dashboard-card col-span-2">
              <h2>User Registration</h2>
              <UserRegistration />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
