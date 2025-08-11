// src/admin/analysis/DashboardContent.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import OrderStatus from './chart/order/OrderStatus';
import ProductCategory from './chart/product/StackBar';
import TopSale from './chart/product/TopSale';
import TopStock from './chart/product/TopStock';
import RevenueByMonth from './chart/revenue/RevenueChart';
import UserRegistration from './chart/user/UserChart';
import './dashboard.css';

export default function DashboardContent() {
  const [activeTab, setActiveTab] = useState('Products');
  const { t } = useTranslation();
  const [productSummary, setProductSummary] = useState(null);
  const [userSummary, setUserSummary] = useState(null);

  useEffect(() => {
    if (activeTab === 'Products') {
      fetch('http://localhost:5000/api/productManagement')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.summary) {
            setProductSummary(data.data.summary);
          } else {
            setProductSummary(null);
          }
        })
        .catch(() => setProductSummary(null));
    }
    if (activeTab === 'Users') {
      fetch('http://localhost:5000/api/userManagement')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.summary) {
            setUserSummary(data.data.summary);
          } else {
            setUserSummary(null);
          }
        })
        .catch(() => setUserSummary(null));
    }
  }, [activeTab]);

  return (
    <div className="main-content-area">
      <h1 className="page-title">{t('dashboardTitle')}</h1>

      <div className="dashboard-tabs">
        {['Products', 'Orders', 'Users', 'Revenue'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`dashboard-tab-button ${activeTab === tab ? 'active' : ''}`}
          >
            {t(tab.toLowerCase())}
          </button>
        ))}
      </div>

      {activeTab === 'Products' && productSummary && (
        <div
          className="dashboard-product-summary"
          style={{
            top: 0,
            zIndex: 10,
            width: '100%',
            display: 'flex',
            gap: '1.5rem',
            padding: '1rem 0',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div className="dashboard-card" style={{ minWidth: 160, textAlign: 'center'}}>
            {t('totalProducts')}: {productSummary.totalAllProducts}
          </div>
          <div className="dashboard-card" style={{ minWidth: 160, textAlign: 'center'}}>
            {t('availableProducts')}: {productSummary.totalAvailableProducts}
          </div>
          <div className="dashboard-card" style={{ minWidth: 160, textAlign: 'center'}}>
            {t('outOfStockProducts')}: {productSummary.totalOutOfStockProducts}
          </div>
          <div className="dashboard-card" style={{ minWidth: 160, textAlign: 'center'}}>
            {t('deletedProducts')}: {productSummary.totalDeletedProducts}
          </div>
          <div className="dashboard-card" style={{ minWidth: 160, textAlign: 'center'}}>
            {t('totalStockQuantity')}: {productSummary.totalStockQuantity}
          </div>
        </div>
      )}

      {activeTab === 'Users' && userSummary && (
        <div
          className="dashboard-user-summary"
          style={{
            top: 0,
            zIndex: 10,
            width: '100%',
            display: 'flex',
            gap: '1.5rem',
            padding: '1rem 0',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div className="dashboard-card" style={{ minWidth: 160, textAlign: 'center'}}>
            {t('totalUsers')}: {userSummary.totalAllUsers}
          </div>
          <div className="dashboard-card" style={{ minWidth: 160, textAlign: 'center'}}>
            {t('activeUsers')}: {userSummary.totalActiveUsers}
          </div>
          <div className="dashboard-card" style={{ minWidth: 160, textAlign: 'center'}}>
            {t('deletedUsers')}: {userSummary.totalDeletedUsers}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'Products' && (
          <>
            <div className="dashboard-card">
              <h2>{t('productsByCategory')}</h2>
              <ProductCategory />
            </div>

            <div className="dashboard-card">
              <h2>{t('topStockedProducts')}</h2>
              <div className="top-stock-scroll">
                <TopStock />
              </div>
            </div>

            <div className="dashboard-card">
              <h2>{t('bestSellers')}</h2>
              <div className="top-stock-scroll">
                <TopSale />
              </div>
            </div>
          </>
        )}

        {activeTab === 'Orders' && (
          <div className="dashboard-card col-span-2">
            <h2>{t('ordersByStatus')}</h2>
            <OrderStatus />
          </div>
        )}

        {activeTab === 'Revenue' && (
          <div className="dashboard-card col-span-2">
            <h2>{t('revenueByMonth')}</h2>
            <RevenueByMonth />
          </div>
        )}

        {activeTab === 'Users' && (
          <div className="dashboard-card col-span-2">
            <h2>{t('userRegistration')}</h2>
            <UserRegistration />
          </div>
        )}
      </div>
    </div>
  );
}
