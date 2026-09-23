import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../services/api';
import { PaginatedUserList, Role, User } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Pagination } from '../components/Pagination';
import { useToast } from '../context/ToastContext';
import {
  Users,
  Search,
  ArrowUpDown,
  ShieldCheck,
  User as UserIcon,
  X,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { showToast } = useToast();

  const [data, setData] = useState<PaginatedUserList | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [searchInput, setSearchInput] = useState<string>('');
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [sortField, setSortField] = useState<'id' | 'username' | 'created_at'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Role edit modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<Role>('user');
  const [isUpdatingRole, setIsUpdatingRole] = useState<boolean>(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.admin.getUsers({
        page,
        limit,
        search: activeSearch || undefined,
        sort: sortField,
        order: sortOrder,
      });
      setData(response);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch user list.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, activeSearch, sortField, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    setPage(1);
  };

  const openRoleModal = (u: User) => {
    setSelectedUser(u);
    setNewRole(u.role);
    setRoleError(null);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    if (newRole === selectedUser.role) {
      setSelectedUser(null);
      return;
    }

    setIsUpdatingRole(true);
    setRoleError(null);
    try {
      await api.admin.updateRole(selectedUser.id, newRole);
      showToast(`User ${selectedUser.username}'s role changed to ${newRole}.`, 'success');
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setRoleError(err.message);
      } else {
        setRoleError('Failed to update role. Please verify permissions.');
      }
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2.5rem',
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.65rem', background: 'rgba(236, 72, 153, 0.15)', borderRadius: 'var(--radius-full)', color: '#f472b6', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            <ShieldCheck size={13} />
            Admin Only
          </div>
          <h1 style={{ fontSize: '2rem' }}>
            User <span className="gradient-text">Management</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Search registered accounts, inspect permissions, and promote or demote roles.
          </p>
        </div>

        <Link to="/admin" className="btn btn-secondary btn-sm">
          Admin Overview
        </Link>
      </div>

      {/* Search & Sort Filters */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearchSubmit} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          alignItems: 'end',
        }}>
          {/* Search Input */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Search size={14} /> Search by Username or Email
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {activeSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="btn btn-secondary btn-sm"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
            </div>
          </div>

          {/* Sort By */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ArrowUpDown size={14} /> Sort Field
            </label>
            <select
              className="form-select"
              value={sortField}
              onChange={(e) => {
                setSortField(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="id">User ID</option>
              <option value="username">Username</option>
              <option value="created_at">Joined Date</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Order</label>
            <select
              className="form-select"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="asc">Ascending (A-Z, Oldest)</option>
              <option value="desc">Descending (Z-A, Newest)</option>
            </select>
          </div>
        </form>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#fda4af',
          marginBottom: '2rem',
        }}>
          {error}
        </div>
      )}

      {/* Users Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading user directory..." />
      ) : !data || data.items.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Users size={36} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Users Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {activeSearch ? `No user matched search query "${activeSearch}".` : 'No registered users.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Member Since</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => {
                  const roleBadgeClass =
                    u.role === 'admin'
                      ? 'badge-admin'
                      : u.role === 'astrologer'
                      ? 'badge-astrologer'
                      : 'badge-user';

                  const formattedDate = u.created_at
                    ? new Date(u.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A';

                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{u.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                          <UserIcon size={15} color="#c4b5fd" />
                          {u.username}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span className={`badge ${roleBadgeClass}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {formattedDate}
                      </td>
                      <td>
                        <button
                          onClick={() => openRoleModal(u)}
                          className="btn btn-secondary btn-sm"
                        >
                          Change Role
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={data.page}
            totalPages={data.pages}
            totalItems={data.total}
            limit={data.limit}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Change Role Modal */}
      {selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 1000,
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '2rem', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Update Role for {selectedUser.username}</h3>
              <button
                onClick={() => setSelectedUser(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {roleError && (
              <div style={{
                padding: '0.85rem 1rem',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: '#fda4af',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}>
                {roleError}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Select System Role</label>
              <select
                className="form-select"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                disabled={isUpdatingRole}
              >
                <option value="user">User (Standard reading access)</option>
                <option value="astrologer">Astrologer (Review queue & notes)</option>
                <option value="admin">Admin (Full administrative power)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedUser(null)}
                disabled={isUpdatingRole}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveRole}
                disabled={isUpdatingRole || newRole === selectedUser.role}
              >
                {isUpdatingRole ? 'Updating...' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
