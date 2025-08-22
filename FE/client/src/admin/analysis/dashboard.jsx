// src/admin/analysis/DashboardContent.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import OrderStatus from './chart/order/OrderStatus';
import OrderAnnually from './chart/order/OrderAnnually';
import ProductCategory from './chart/product/StackBar';
import TopSale from './chart/product/TopSale';
import TopStock from './chart/product/TopStock';
import RevenueByMonth from './chart/revenue/RevenueChart';
import UserRegistration from './chart/user/UserChart';
import RevenueByCategory from './chart/revenue/RevenueByCategory';
import TopUser from './chart/user/TopUser';
import './dashboard.css';

export default function DashboardContent() {
  const [activeTab, setActiveTab] = useState('Products');
  const { t } = useTranslation();
  const [productSummary, setProductSummary] = useState(null);
  const [userSummary, setUserSummary] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);
  const [revenueSummary, setRevenueSummary] = useState(null);

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
    if (activeTab === 'Orders') {
      fetch('http://localhost:5000/api/orders?page=1&limit=1')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.pagination) {
            setOrderSummary(data.data.pagination);
          } else {
            setOrderSummary(null);
          }
        })
        .catch(() => setOrderSummary(null));
    }
    if (activeTab === 'Revenue') {
      fetch('http://localhost:5000/api/analysis/revenue/by-time')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.summary) {
            setRevenueSummary(data.data.summary);
          } else {
            setRevenueSummary(null);
          }
        })
        .catch(() => setRevenueSummary(null));
    }
  }, [activeTab]);

  return (
    <div className="main-content-area">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>{t('dashboardTitle')}</h1>
        <div className="dashboard-tabs" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
          {['Products', 'Orders', 'Users', 'Revenue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`dashboard-tab-button ${activeTab === tab ? 'active' : ''}`}
              style={{
                fontSize: '0.85rem',
                padding: '0.3rem 0.8rem',
                borderRadius: '6px',
                minWidth: '80px',
                height: '2rem',
                background: activeTab === tab ? '#e0e7ef' : '#ffffff',
                border: '1px solid #d1d5db',
                color: '#333',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t(tab.toLowerCase())}
            </button>
          ))}
        </div>
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
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="card-block-style">
                  <div className="label-style">{t('totalProducts')}</div>
                  <div className="number-style">{productSummary.totalAllProducts}</div>
                </div>
                <div className="card-block-style">
                  <div className="label-style">{t('availableProducts')}</div>
                  <div className="number-style">{productSummary.totalAvailableProducts}</div>
                </div>
                <div className="card-block-style">
                  <div className="label-style">{t('outOfStockProducts')}</div>
                  <div className="number-style">{productSummary.totalOutOfStockProducts}</div>
                </div>
                <div className="card-block-style">
                  <div className="label-style">{t('deletedProducts')}</div>
                  <div className="number-style">{productSummary.totalDeletedProducts}</div>
                </div>
                <div className="card-block-style">
                  <div className="label-style">{t('totalStockQuantity')}</div>
                  <div className="number-style">{productSummary.totalStockQuantity}</div>
                </div>
              </div>
            </div>
        </div>
      )}

      {activeTab === 'Users' && userSummary && (
        <>
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
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="card-block-style">
                  <div className="label-style">{t('totalUsers')}</div>
                  <div className="number-style">{userSummary.totalAllUsers}</div>
                </div>
                <div className="card-block-style">
                  <div className="label-style">{t('activeUsers')}</div>
                  <div className="number-style">{userSummary.totalActiveUsers}</div>
                </div>
                <div className="card-block-style">
                  <div className="label-style">{t('deletedUsers')}</div>
                  <div className="number-style">{userSummary.totalDeletedUsers}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="dashboard-card">
              <h2>{t('userRegistration')}</h2>
              <UserRegistration />
            </div>
            <div className="dashboard-card">
              <h2>{t('topUsers')}</h2>
              <TopUser />
            </div>
          </div>
        </>
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
              <TopStock />
            </div>

            <div className="dashboard-card">
              <h2>{t('bestSellers')}</h2>
                <TopSale />
            </div>
          </>
        )}
      </div>

          {activeTab === 'Orders' && orderSummary && (
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
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                  <div className="card-block-style">
                    <div className="label-style">{t('totalOrders')}</div>
                    <div className="number-style">{orderSummary.totalOrders.toLocaleString()}</div>
                  </div>
                </div>
            </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'Orders' && (
            <>
              <div className="dashboard-card">
                <h2>Orders Annually</h2>
                <OrderAnnually />
              </div>
              <div className="dashboard-card">
                <h2>{t('ordersByStatus')}</h2>
                <OrderStatus />
              </div>
            </>
        )}
      </div>

        {activeTab === 'Revenue' && (
          <>
            {revenueSummary && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <div className="card-block-style">
                  <div className="label-style">{t('totalRevenue')}</div>
                  <div className="number-style">{revenueSummary.totalRevenue.toLocaleString()} VND</div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="dashboard-card">
                <h2>{t('revenueByMonth')}</h2>
                <RevenueByMonth />
              </div>
              <div className="dashboard-card">
                <h2>{t('revenueByCategory')}</h2>
                <RevenueByCategory />
              </div>
            </div>
          </>
        )}
      </div>
  );
}
