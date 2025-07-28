import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/navbar/navbar';
import Footer from '../../../components/footer/footer';
import defaultAvatar from './avatar-default.svg';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 5;

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchUsers = async (pageNumber) => {
    setLoading(true);
    try {
        const res = await fetch(`http://localhost:5000/api/userManagement?page=${pageNumber}&limit=${PAGE_SIZE}`);
        const data = await res.json();
        console.log('Fetched users:', data);
        
        if (Array.isArray(data.data.users)) {
        const activeUsers = data.data.users.filter(user => !user.isDeleted);
        setUsers(activeUsers);
        console.log('Active users:', activeUsers);
        setTotalUsers(data.data.pagination?.totalUsers || 0);
        setTotalPages(data.data.pagination?.totalPages || 1);
        } else {
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
    } finally {
        setLoading(false);
    }
};


  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  useEffect(() => {
    const s = search.trim().toLowerCase();
    if (!s) {
      setFiltered(users);
    } else {
      setFiltered(
        users.filter(
          user =>
            (user.name && user.name.toLowerCase().includes(s)) ||
            (user._id && user._id.toLowerCase().includes(s))
        )
      );
    }
  }, [search, users]);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>User Management</h2>
        <input
          type="text"
          placeholder="Search by name or ID"
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
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '0.7rem', border: '1px solid #eee' }}>ID</th>
                  <th style={{ padding: '0.7rem', border: '1px solid #eee' }}>Avatar</th>
                  <th style={{ padding: '0.7rem', border: '1px solid #eee' }}>Name</th>
                  <th style={{ padding: '0.7rem', border: '1px solid #eee' }}>Email</th>
                  <th style={{ padding: '0.7rem', border: '1px solid #eee' }}>Status</th>
                  <th style={{ padding: '0.7rem', border: '1px solid #eee' }}>Registered Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#888' }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user._id} onClick={() => navigate(`/admin/users/${user._id}`)} 
                        style={{
                            cursor: 'pointer',
                            backgroundColor: '#fff',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}>
                      <td style={{ padding: '0.7rem', border: '1px solid #eee', fontFamily: 'monospace' }}>{user._id}</td>
                      <td style={{ padding: '0.7rem', border: '1px solid #eee', textAlign: 'center' }}>
                        <img
                            src={user.avatar || defaultAvatar}
                            alt={`${user.name}'s avatar`||'Default Avatar'}
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
                              user.status === 'active'
                                ? 'green'
                                : user.status === 'inactive'
                                ? 'orange'
                                : user.status === 'suspended'
                                ? 'red'
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
                                outline: 'none',
                                boxShadow: 'none',
                            }}
                        >
                            &#8592;
                        </button>
                        <span style={{ fontWeight: 600, fontSize: 18 }}>{page}</span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages || totalPages === 0}
                            style={{
                                fontSize: 20,
                                padding: '4px 12px',
                                cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                                opacity: (page === totalPages || totalPages === 0) ? 0.5 : 1,
                                border: 'none',
                                background: 'none',
                                outline: 'none',
                                boxShadow: 'none',
                            }}
                        >
                            &#8594;
                        </button>
                    </div>
      </div>
      <Footer />
    </>
  );
}

export default UserManagement;
