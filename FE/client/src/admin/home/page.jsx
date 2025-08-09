import {BarChart3, ShoppingCart, Users, Package, Settings, User} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router-dom';
import './home.css';
import logo from './logo.png';

const SIDEBAR_ITEMS = [
  { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/admin/dashboard' },
  { id: 'orders', icon: ShoppingCart, label: 'Order Management', path: '/admin/orders' },
  { id: 'products', icon: Package, label: 'Product Management', path: '/admin/products' },
  { id: 'users', icon: Users, label: 'User Management', path: '/admin/users' },
  { id: 'system', icon: Settings, label: 'System Management', path: '/admin/system' }
];

export default function AdminDashboard() {
  const { t } = useTranslation();

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav>
          <p className="section-title">{t('mainMenu', 'Main Menu')}</p>
          {SIDEBAR_ITEMS.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="icon" /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button><User className="icon" />{t('logOut', 'Log Out')}</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
