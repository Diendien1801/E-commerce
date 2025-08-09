import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from './avatar-default.svg';
import { useTranslation } from 'react-i18next';
import './user.css'; 

const PAGE_SIZE = 5;

const statusBadgeClass = (status) => {
  if (status === 'active') return 'badge done';
  if (status === 'inactive' || status === 'suspended') return 'badge pending';
  return 'badge';
};

const UserRow = ({ user, navigate, t }) => (
  <tr onClick={() => navigate(`/admin/users/${user._id}`)} className="table-row">
    <td>{user._id}</td>
    <td>
      <div className="row-user">
        <div className="avatar-sm">
          <img
            src={user.avatar || defaultAvatar}
            alt={`${user.name || 'Default'}'s avatar`}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        </div>
        <span>{user.name || '-'}</span>
      </div>
    </td>
    <td>{user.email || 'Log in with Facebook'}</td>
    <td style={{ textAlign: 'center' }}>
      <span className={statusBadgeClass(user.status)}>{user.status || '-'}</span>
    </td>
    <td style={{ textAlign: 'center' }}>
      {user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
    </td>
  </tr>
);

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchUsers = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/userManagement?page=${pageNumber}&limit=${PAGE_SIZE}`
      );
      const data = await res.json();
      if (Array.isArray(data.data.users)) {
        setUsers(data.data.users);
        setFiltered(data.data.users);
        setTotalPages(data.data.pagination?.totalPages || 1);
      } else {
        setUsers([]);
        setFiltered([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setFiltered([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchedUsers = async (query) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/userManagement/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setFiltered(Array.isArray(data.data.users) ? data.data.users : []);
      setTotalPages(1);
    } catch (error) {
      console.error('Search failed:', error);
      setFiltered([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const s = search.trim();
      if (s) {
        setPage(1);
        fetchSearchedUsers(s);
      } else {
        fetchUsers(page);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, page]);

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div className="product-management-header">
        <h1 className="page-title">{t('userManagement', 'User Management')}</h1>
      </div>

      <input
        type="text"
        placeholder={t('searchByEmail', 'Search by User ID or Email')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th>{t('id', 'ID')}</th>
                <th>{t('name', 'Name')}</th>
                <th>{t('email', 'Email')}</th>
                <th style={{ textAlign: 'center' }}>{t('status1', 'Status')}</th>
                <th style={{ textAlign: 'center' }}>{t('registerDate', 'Registered Date')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-data">
                    {t('noUserFound', 'No users found.')}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <UserRow key={user._id} user={user} navigate={navigate} t={t} />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div
        className="users-pagination"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          margin: '24px 0'
        }}
      >
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          style={{
            fontSize: 20,
            padding: '4px 12px',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            opacity: page === 1 ? 0.5 : 1,
            border: 'none',
            background: 'none'
          }}
        >
          &#8592;
        </button>
        <span style={{ fontWeight: 600, fontSize: 18 }}>{page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          style={{
            fontSize: 20,
            padding: '4px 12px',
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
            opacity: page === totalPages ? 0.5 : 1,
            border: 'none',
            background: 'none'
          }}
        >
          &#8594;
        </button>
      </div>
    </div>
  );
}
