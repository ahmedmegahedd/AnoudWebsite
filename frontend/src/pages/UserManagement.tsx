import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  current: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false
  });
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  const fetchUsers = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`http://localhost:3231/api/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'superadmin') => {
    try {
      setUpdatingUser(userId);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:3231/api/users/${userId}/promote`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
      }

      // Update the user in the local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));

      const action = newRole === 'admin' ? 'promoted to admin' : 
                     newRole === 'user' ? 'demoted to user' : 
                     `updated to ${newRole}`;
      showNotification(`User ${action} successfully!`, 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user role';
      showNotification(errorMessage, 'error');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingUser(userId);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:3231/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      // Remove the user from the local state
      setUsers(users.filter(user => user._id !== userId));
      showNotification('User deleted successfully!', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      showNotification(errorMessage, 'error');
    } finally {
      setDeletingUser(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'badge-error';
      case 'admin':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  const canManageUser = (targetUser: User) => {
    // Super admin can manage everyone except themselves
    if (currentUser?.role === 'superadmin') {
      return targetUser._id !== currentUser.id;
    }
    // Admin can manage users except themselves and other admins/superadmins
    if (currentUser?.role === 'admin') {
      return targetUser._id !== currentUser.id && targetUser.role !== 'admin' && targetUser.role !== 'superadmin';
    }
    return false;
  };

  const canPromoteToAdmin = (targetUser: User) => {
    if (!canManageUser(targetUser)) return false;
    return targetUser.role === 'user';
  };

  const canDemoteToUser = (targetUser: User) => {
    if (!canManageUser(targetUser)) return false;
    return targetUser.role === 'admin';
  };

  const canDeleteUser = (targetUser: User) => {
    if (!canManageUser(targetUser)) return false;
    // Never allow deletion of superadmin or the main admin email
    if (targetUser.role === 'superadmin' || targetUser.email === 'ahmedmegahedbis@gmail.com') {
      return false;
    }
    return true;
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            Loading users...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <div className="error-state">
            <div className="error-message">{error}</div>
            <button onClick={() => fetchUsers()} className="btn btn-primary mt-lg">
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="admin-header">
        <div className="admin-content">
          <div className="flex justify-between items-center">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => navigate('/admin')}
                style={{
                  background: 'var(--text-secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ← Back to Admin Page
              </button>
              <div>
                <h1 className="headline-large">⚙️ Manage Users</h1>
                <p className="body-large text-secondary">Promote or remove users</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="section">
        <div className="container">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSearch} className="flex gap-md items-end">
                <div className="form-group flex-1">
                  <label htmlFor="search" className="form-label">Search Users</label>
                  <input
                    type="text"
                    id="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="form-input"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
                {search && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setSearch('');
                      fetchUsers(1, '');
                    }}
                    className="btn btn-secondary"
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Users Table */}
      <section className="section">
        <div className="container">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>
                          <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="flex gap-sm">
                            {/* Promote to Admin Button */}
                            {canPromoteToAdmin(user) && (
                              <button
                                onClick={() => handleRoleChange(user._id, 'admin')}
                                disabled={updatingUser === user._id}
                                className="btn btn-warning btn-small"
                                title="Promote to Admin"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '6px 12px',
                                  fontSize: '12px'
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                                Promote
                              </button>
                            )}

                            {/* Demote to User Button */}
                            {canDemoteToUser(user) && (
                              <button
                                onClick={() => handleRoleChange(user._id, 'user')}
                                disabled={updatingUser === user._id}
                                className="btn btn-secondary btn-small"
                                title="Demote to User"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '6px 12px',
                                  fontSize: '12px'
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                Demote
                              </button>
                            )}

                            {/* Delete User Button */}
                            {canDeleteUser(user) && (
                              <button
                                onClick={() => handleDeleteUser(user._id, user.name)}
                                disabled={deletingUser === user._id}
                                className="btn btn-error btn-small"
                                title="Delete User"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '6px 12px',
                                  fontSize: '12px'
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                                {deletingUser === user._id ? 'Deleting...' : 'Delete'}
                              </button>
                            )}

                            {/* Loading State */}
                            {updatingUser === user._id && (
                              <span className="text-secondary" style={{ fontSize: '12px' }}>
                                Updating...
                              </span>
                            )}

                            {/* No Actions Available */}
                            {!canManageUser(user) && (
                              <span className="text-secondary" style={{ fontSize: '12px' }}>
                                No actions available
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total > 1 && (
                <div className="flex justify-between items-center mt-lg">
                  <div className="text-secondary">
                    Page {pagination.current} of {pagination.total}
                  </div>
                  <div className="flex gap-sm">
                    <button
                      onClick={() => fetchUsers(pagination.current - 1, search)}
                      disabled={!pagination.hasPrev}
                      className="btn btn-secondary btn-small"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => fetchUsers(pagination.current + 1, search)}
                      disabled={!pagination.hasNext}
                      className="btn btn-secondary btn-small"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {users.length === 0 && (
                <div className="empty-state text-center">
                  <h3 className="headline-small mb-lg">No users found</h3>
                  <p className="body-large text-secondary">
                    {search ? 'Try adjusting your search criteria.' : 'No users have been registered yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default UserManagement; 