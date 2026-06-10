import React from 'react';
import { User } from '../types/auth.types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="dashboard-split">
      {/* Left Panel - User Welcome */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <div className="user-greeting">
            <h1>Hello, {user.username}!</h1>
            <p>Welcome to your dashboard</p>
          </div>
          <button className="logout-btn-dashboard" onClick={onLogout}>
            LOGOUT
          </button>
        </div>
      </div>

      {/* Right Panel - User Info */}
      <div className="dashboard-info">
        <div className="info-content">
          <h2>Account Information</h2>
          
          <div className="info-card">
            <div className="info-item">
              <span className="info-label">Username</span>
              <span className="info-value">{user.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email Address</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className="info-value status-badge">Active ✓</span>
            </div>
          </div>

          <div className="activity-card">
            <h3>Recent Activity</h3>
            <div className="activity-item">
              <span className="activity-icon"></span>
              <div className="activity-details">
                <p>Last login</p>
                <small>Just now</small>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon"></span>
              <div className="activity-details">
                <p>Email verified</p>
                <small>{new Date(user.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;