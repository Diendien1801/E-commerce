import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/navbar/navbar';
import Footer from '../../../components/footer/footer';
import defaultAvatar from './avatar-default.svg';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 5;

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchUsers = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/userManagement?page=${pageNumber}&limit=${PAGE_SIZE}`);
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
      const res = await fetch(`http://localhost:5000/api/userManagement/search?q=${encodeURIComponent(query)}`);
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

  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem', minHeight: '500px' }}>
        <h2 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>{t("userManagement", "User Management")}</h2>
        <input
          type="text"
          placeholder={t("searchByEmail", "Search by Email")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            marginBottom: '1.5rem',
            border: '1px solid #ccc',
            borderRadius: 6,
            fontSize: '1rem',
          }}
        />
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', fontFamily: 'Arial', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '0.7rem', border: '1px solid #eee' }}>{t("id", "ID")}</th>
                  <th style={{ padding: '0.7rem', border: '1px solid #eee' }}>{t("avatar", "Avatar")}</th>
                  <th style={{ padding: '0.7rem', border: '1px solid #eee' }}>{t("name", "Name")}</th>
                  <th style={{ padding: '0.7rem', border: '1px solid #eee' }}>{t("email", "Email")}</th>
                  <th style={{ padding: '0.7rem', border: '1px solid #eee' }}>{t('status1', 'Status')}</th>
                  <th style={{ padding: '0.7rem', border: '1px solid #eee' }}>{t("registerDate", "Registered Date")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#888' }}>
                      {t('noUserFound', 'No users found.')}
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr
                      key={user._id} onClick={() => navigate(`/admin/users/${user._id}`)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: '#fff',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}>
                      <td style={{ padding: '0.7rem', border: '1px solid #eee' }}>{user._id}</td>
                      <td style={{ padding: '0.7rem', border: '1px solid #eee', textAlign: 'center' }}>
                        <img
                          src={user.avatar || defaultAvatar}
                          alt={`${user.name || 'Default'}'s avatar`}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      </td>
                      <td style={{ padding: '0.7rem', border: '1px solid #eee' }}>{user.name || '-'}</td>
                      <td style={{ padding: '0.7rem', border: '1px solid #eee' }}>{user.email || 'Log in with Facebook'}</td>
                      <td
                        style={{
                          padding: '0.7rem',
                          border: '1px solid #eee',
                          textAlign: 'center',
                          color:
                            user.status === 'active' ? 'green'
                              : user.status === 'inactive' ? 'orange'
                              : user.status === 'suspended' ? 'red'
                              : 'black',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                        }}
                      >
                        {user.status || '-'}
                      </td>
                      <td style={{ padding: '0.7rem', border: '1px solid #eee' }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="users-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '24px 0' }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            style={{
              fontSize: 20,
              padding: '4px 12px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.5 : 1,
              border: 'none',
              background: 'none',
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
              background: 'none',
            }}>
            &#8594;
          </button>
        </div>
      </div>
      <Footer />
    </>
);}

export default UserManagement;
