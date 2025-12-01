import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Profile = () => {
  const { user, isAuthenticated, updateProfile, changePassword, logout } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="main-content">
        <div className="card text-center">
          <h2>Please Login</h2>
          <p>You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const formData = new FormData(e.target);
    const profileData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || null
    };

    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage(result.error || 'Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const formData = new FormData(e.target);
    const passwordData = {
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword')
    };

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const result = await changePassword(passwordData);
      if (result.success) {
        setMessage('Password changed successfully!');
        e.target.reset();
      } else {
        setMessage(result.error || 'Failed to change password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderOverview = () => (
    <div>
      <h2>Profile Overview</h2>
      <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white'
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3>{user?.name || 'User'}</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>{user?.email}</p>
            <span style={{
              backgroundColor: 'var(--color-surface)',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              border: '1px solid var(--color-border)'
            }}>
              {user?.role || 'user'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
          <div className="card">
            <h4>Account Status</h4>
            <p style={{ color: 'var(--color-success)' }}>✅ Active</p>
          </div>
          <div className="card">
            <h4>Email Verified</h4>
            <p style={{ color: user?.emailVerified ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {user?.emailVerified ? '✅ Verified' : '⚠️ Not Verified'}
            </p>
          </div>
          <div className="card">
            <h4>Member Since</h4>
            <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</p>
          </div>
          <div className="card">
            <h4>Phone</h4>
            <p>{user?.phone || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditProfile = () => (
    <div>
      <h2>Edit Profile</h2>
      <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
        {message && (
          <div style={{
            backgroundColor: message.includes('success') ? 'var(--color-success)' : 'var(--color-error)',
            color: 'white',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              defaultValue={user?.name || ''}
              className="form-input"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              defaultValue={user?.email || ''}
              className="form-input"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              defaultValue={user?.phone || ''}
              className="form-input"
              placeholder="Optional"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div>
      <h2>Security Settings</h2>
      
      <div className="card" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-lg)' }}>
        <h3>Change Password</h3>
        {message && (
          <div style={{
            backgroundColor: message.includes('success') ? 'var(--color-success)' : 'var(--color-error)',
            color: 'white',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              className="form-input"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="newPassword"
              className="form-input"
              required
              minLength="8"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              required
              minLength="8"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
        <h3>Danger Zone</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="btn" style={{ backgroundColor: 'var(--color-error)', color: 'white' }}>
          Delete Account
        </button>
      </div>
    </div>
  );

  return (
    <div className="main-content">
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1>My Profile</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Manage your account settings and preferences
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)', borderBottom: '1px solid var(--color-border)' }}>
        {[
          { id: 'overview', label: 'Overview', icon: '👤' },
          { id: 'edit', label: 'Edit Profile', icon: '✏️' },
          { id: 'security', label: 'Security', icon: '🔒' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="btn"
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--color-text)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : 'none',
              borderRadius: '0',
              padding: 'var(--spacing-md) var(--spacing-lg)'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'edit' && renderEditProfile()}
      {activeTab === 'security' && renderSecurity()}
    </div>
  );
};

export default Profile;
