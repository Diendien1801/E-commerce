// src/admin/analysis/DashboardContent.jsx
import { useState } from 'react';
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

  return (
    <div className="main-content-area">
      <h1 className="page-title">{t('dashboardTitle')}</h1>

      {/* Tab buttons */}
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

      {/* Charts grid */}
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
