import React, { useEffect, useState } from 'react';
import { BarChart3, Home, ShoppingCart, Users, Package, Settings, User, Tags } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useNavigate} from 'react-router-dom';
import { useAuth } from '../../components/context/authcontext'; 
import logo from './logo.png';
import './home.css';

const SIDEBAR_ITEMS = [
  { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/admin/dashboard' },
  { id: 'crawl', icon: Settings, label: 'Crawl Data', path: '/admin/crawl' },
  { id: 'orders', icon: ShoppingCart, label: 'Order Management', path: '/admin/orders' },
  { id: 'products', icon: Package, label: 'Product Management', path: '/admin/products' },
  { id: 'categories', icon: Tags, label: 'Category Management', path: '/admin/categories' },
  { id: 'users', icon: Users, label: 'User Management', path: '/admin/users' }
];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { isLoggedIn, user, logout } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  const userId = user?._id || user?.userId || user?.id;

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`https://e-commerce-mf45.onrender.com/api/users/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setUserRole(data.data.role);
      } catch (err) {
        console.error('Error fetching user role:', err);
      }
    };
    fetchUserRole();
  }, [userId]);

  useEffect(() => {
    if (isLoggedIn && userRole && userRole !== 'admin') {
      navigate('/'); 
    }
    if (!isLoggedIn) {
      navigate('/login'); 
    }
  }, [isLoggedIn, userRole, navigate]);

  if (!isLoggedIn || userRole !== 'admin') {
    return null; 
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav>
          <p className="menu-title">{t('mainMenu', 'Main Menu')}</p>
          {SIDEBAR_ITEMS.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }>
              <item.icon /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={() => { navigate('/'); }}>
            <Home/>{t('home1', 'Home')}
          </button>
          <button onClick={() => { logout(); navigate('/'); }}>
            <User/>{t('logOut', 'Log Out')}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
