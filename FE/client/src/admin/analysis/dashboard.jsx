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
  const { t, i18n } = useTranslation();
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

      {/* Language Switch Button for Admin Dashboard Footer */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '32px 0 0 0' }}>
        <button
          className="lang-switch-btn"
          onClick={() => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}
          style={{
            fontSize: '1rem',
            padding: '0.4rem 1.2rem',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            background: '#fff',
            color: '#333',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          {i18n.language === 'vi' ? (
            <>
              <svg width="20" height="15" viewBox="0 0 32 24" style={{ verticalAlign: 'middle', marginRight: 6 }} xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_270_67379)"><rect width="32" height="24" fill="white"/><path fillRule="evenodd" clipRule="evenodd" d="M0 0H32V24H0V0Z" fill="#F7FCFF"/><path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="#E31D1C"/><mask id="mask0_270_67379" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="24"><path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="white"/></mask><g mask="url(#mask0_270_67379)"><path fillRule="evenodd" clipRule="evenodd" d="M16.0619 15.98L10.9111 19.2549L12.6388 13.5219L8.96483 9.77622L14.03 9.66557L16.271 4.00574L18.313 9.74033L23.3661 9.82853L19.5688 13.6429L21.342 19.0968L16.0619 15.98Z" fill="#FFD221"/></g></g><defs><clipPath id="clip0_270_67379"><rect width="32" height="24" fill="white"/></clipPath></defs></svg>
              VI
            </>
          ) : (
            <>
              <svg width="20" height="15" viewBox="0 0 32 24" style={{ verticalAlign: 'middle', marginRight: 6 }} xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_270_67366)"><rect width="32" height="24" fill="white"/><path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="#2E42A5"/><mask id="mask0_270_67366" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="24"><path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="white"/></mask><g mask="url(#mask0_270_67366)"><path d="M-3.56311 22.2854L3.47858 25.2635L32.1598 3.23787L35.8741 -1.18761L28.3441 -2.18297L16.6457 7.3085L7.22968 13.7035L-3.56311 22.2854Z" fill="white"/><path d="M-2.59912 24.3719L0.988295 26.1001L34.5403 -1.59881H29.5032L-2.59912 24.3719Z" fill="#F50100"/><path d="M35.5631 22.2854L28.5214 25.2635L-0.159817 3.23787L-3.87415 -1.18761L3.65593 -2.18297L15.3543 7.3085L24.7703 13.7035L35.5631 22.2854Z" fill="white"/><path d="M35.3229 23.7829L31.7355 25.5111L17.4487 13.6518L13.2129 12.3267L-4.23151 -1.17246H0.805637L18.2403 12.0063L22.8713 13.5952L35.3229 23.7829Z" fill="#F50100"/><mask id="path-7-inside-1_270_67366" fill="white"><path fillRule="evenodd" clipRule="evenodd" d="M19.7778 -2H12.2222V8H-1.97247V16H12.2222V26H19.7778V16H34.0275V8H19.7778V-2Z"/></mask><path fillRule="evenodd" clipRule="evenodd" d="M19.7778 -2H12.2222V8H-1.97247V16H12.2222V26H19.7778V16H34.0275V8H19.7778V-2Z" fill="#F50100"/><path d="M12.2222 -2V-4H10.2222V-2H12.2222ZM19.7778 -2H21.7778V-4H19.7778V-2ZM12.2222 8V10H14.2222V8H12.2222ZM-1.97247 8V6H-3.97247V8H-1.97247ZM-1.97247 16H-3.97247V18H-1.97247V16ZM12.2222 16H14.2222V14H12.2222V16ZM12.2222 26H10.2222V28H12.2222V26ZM19.7778 26V28H21.7778V26H19.7778ZM19.7778 16V14H17.7778V16H19.7778ZM34.0275 16V18H36.0275V16H34.0275ZM34.0275 8H36.0275V6H34.0275V8ZM19.7778 8H17.7778V10H19.7778V8ZM12.2222 0H19.7778V-4H12.2222V0ZM14.2222 8V-2H10.2222V8H14.2222ZM-1.97247 10H12.2222V6H-1.97247V10ZM0.0275269 16V8H-3.97247V16H0.0275269ZM12.2222 14H-1.97247V18H12.2222V14ZM14.2222 26V16H10.2222V26H14.2222ZM19.7778 24H12.2222V28H19.7778V24ZM17.7778 16V26H21.7778V16H17.7778ZM34.0275 14H19.7778V18H34.0275V14ZM32.0275 8V16H36.0275V8H32.0275ZM19.7778 10H34.0275V6H19.7778V10ZM17.7778 -2V8H21.7778V-2H17.7778Z" fill="white" mask="url(#path-7-inside-1_270_67366)"/></g></g><defs><clipPath id="clip0_270_67366"><rect width="32" height="24" fill="white"/></clipPath></defs></svg>
              EN
            </>
          )}
        </button>
      </div>
    </div>
  );
}
