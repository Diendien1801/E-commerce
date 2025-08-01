import OrderStatus from './chart/order/OrderStatus';
import ProductCategory from './chart/product/StackBar';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import TopSale from './chart/product/TopSale';
import TopStock from './chart/product/TopStock';
import RevenueByMonth from './chart/revenue/RevenueChart';
import UserRegistration from './chart/user/UserChart';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Products');
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="dashboard-container">
        <h1 className="dashboard-header">{t('dashboardTitle')}</h1>

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
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
