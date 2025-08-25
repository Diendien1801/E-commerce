import React, { useEffect, useState } from 'react';
import { BarChart3, Home, ShoppingCart, Users, Package, Settings, User, Tags } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useNavigate} from 'react-router-dom';
import { useAuth } from '../../components/context/authcontext'; 
import logo from './logo.png';
import i18n from '../../i18n';
import './home.css';

const SIDEBAR_ITEMS = [
  { id: 'analytics', icon: BarChart3, label: 'sidebar.analytics', path: '/admin/dashboard' },
  { id: 'crawl', icon: Settings, label: 'sidebar.crawlData', path: '/admin/crawl' },
  { id: 'orders', icon: ShoppingCart, label: 'sidebar.orderManagement', path: '/admin/orders' },
  { id: 'products', icon: Package, label: 'sidebar.productManagement', path: '/admin/products' },
  { id: 'categories', icon: Tags, label: 'sidebar.categoryManagement', path: '/admin/categories' },
  { id: 'users', icon: Users, label: 'sidebar.userManagement', path: '/admin/users' }
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

        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/${userId}`);

        // const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/${userId}`);
      

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
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p className="menu-title" style={{ marginLeft: 8 }}>{t('mainMenu', 'Main Menu')}</p>
          <button
            className="lang-switch-btn"
            onClick={() => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}
            style={{
              fontSize: '1rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#fff',
              color: '#333',
              fontWeight: 'semibold',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              margin: '0 8px 8px 0'
            }}
          >
            {i18n.language === 'vi' ? (
              <>
                <svg width="20" height="13" viewBox="0 0 32 24" style={{ verticalAlign: 'middle', marginRight: 3 }} xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_270_67379)"><rect width="32" height="24" fill="white"/><path fillRule="evenodd" clipRule="evenodd" d="M0 0H32V24H0V0Z" fill="#F7FCFF"/><path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="#E31D1C"/><mask id="mask0_270_67379" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="24"><path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="white"/></mask><g mask="url(#mask0_270_67379)"><path fillRule="evenodd" clipRule="evenodd" d="M16.0619 15.98L10.9111 19.2549L12.6388 13.5219L8.96483 9.77622L14.03 9.66557L16.271 4.00574L18.313 9.74033L23.3661 9.82853L19.5688 13.6429L21.342 19.0968L16.0619 15.98Z" fill="#FFD221"/></g></g><defs><clipPath id="clip0_270_67379"><rect width="32" height="24" fill="white"/></clipPath></defs></svg>
                VI
              </>
            ) : (
              <>
                <svg width="20" height="15" viewBox="0 0 32 24" style={{ verticalAlign: 'middle', marginRight: 3 }} xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_270_67366)"><rect width="32" height="24" fill="white"/><path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="#2E42A5"/><mask id="mask0_270_67366" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="24"><path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="white"/></mask><g mask="url(#mask0_270_67366)"><path d="M-3.56311 22.2854L3.47858 25.2635L32.1598 3.23787L35.8741 -1.18761L28.3441 -2.18297L16.6457 7.3085L7.22968 13.7035L-3.56311 22.2854Z" fill="white"/><path d="M-2.59912 24.3719L0.988295 26.1001L34.5403 -1.59881H29.5032L-2.59912 24.3719Z" fill="#F50100"/><path d="M35.5631 22.2854L28.5214 25.2635L-0.159817 3.23787L-3.87415 -1.18761L3.65593 -2.18297L15.3543 7.3085L24.7703 13.7035L35.5631 22.2854Z" fill="white"/><path d="M35.3229 23.7829L31.7355 25.5111L17.4487 13.6518L13.2129 12.3267L-4.23151 -1.17246H0.805637L18.2403 12.0063L22.8713 13.5952L35.3229 23.7829Z" fill="#F50100"/><mask id="path-7-inside-1_270_67366" fill="white"><path fillRule="evenodd" clipRule="evenodd" d="M19.7778 -2H12.2222V8H-1.97247V16H12.2222V26H19.7778V16H34.0275V8H19.7778V-2Z"/></mask><path fillRule="evenodd" clipRule="evenodd" d="M19.7778 -2H12.2222V8H-1.97247V16H12.2222V26H19.7778V16H34.0275V8H19.7778V-2Z" fill="#F50100"/><path d="M12.2222 -2V-4H10.2222V-2H12.2222ZM19.7778 -2H21.7778V-4H19.7778V-2ZM12.2222 8V10H14.2222V8H12.2222ZM-1.97247 8V6H-3.97247V8H-1.97247ZM-1.97247 16H-3.97247V18H-1.97247V16ZM12.2222 16H14.2222V14H12.2222V16ZM12.2222 26H10.2222V28H12.2222V26ZM19.7778 26V28H21.7778V26H19.7778ZM19.7778 16V14H17.7778V16H19.7778ZM34.0275 16V18H36.0275V16H34.0275ZM34.0275 8H36.0275V6H34.0275V8ZM19.7778 8H17.7778V10H19.7778V8ZM12.2222 0H19.7778V-4H12.2222V0ZM14.2222 8V-2H10.2222V8H14.2222ZM-1.97247 10H12.2222V6H-1.97247V10ZM0.0275269 16V8H-3.97247V16H0.0275269ZM12.2222 14H-1.97247V18H12.2222V14ZM14.2222 26V16H10.2222V26H14.2222ZM19.7778 24H12.2222V28H19.7778V24ZM17.7778 16V26H21.7778V16H17.7778ZM34.0275 14H19.7778V18H34.0275V14ZM32.0275 8V16H36.0275V8H32.0275ZM19.7778 10H34.0275V6H19.7778V10ZM17.7778 -2V8H21.7778V-2H17.7778Z" fill="white" mask="url(#path-7-inside-1_270_67366)"/></g></g><defs><clipPath id="clip0_270_67366"><rect width="32" height="24" fill="white"/></clipPath></defs></svg>
                EN
              </>
            )}
          </button>
        </nav>
        <nav>
            {SIDEBAR_ITEMS.map(item => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''}`
                }>
                <item.icon /> {t(item.label)}
              </NavLink>
            ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={() => { navigate('/'); }}>
            <Home/>{t('home1', 'Home')}
          </button>
          <button onClick={() => { logout(); navigate('/'); }}>
            <User/>{t('logout', 'Log Out')}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
