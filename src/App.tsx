import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import InfoPage from './components/InfoPage';
import UploadPage from './components/UploadPage';
import DonePage from './components/DonePage';
import AdminPanel from './components/AdminPanel';
import SecurityScript from './components/SecurityScript';
import axios from 'axios';
import './App.css';

function App() {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    // Track website visit when app loads (only once per session)
    const trackVisit = async () => {
      // Check if we've already tracked this visit in this session
      const sessionKey = `visit_tracked_${window.location.pathname}`;
      if (sessionStorage.getItem(sessionKey)) {
        console.log('Visit already tracked for this session');
        return;
      }

      try {
        await axios.post(`${API_BASE_URL}/track-visit`, {
          path: window.location.pathname
        });
        console.log('✅ Website visit tracked for:', window.location.pathname);
        // Mark as tracked for this session
        sessionStorage.setItem(sessionKey, 'true');
      } catch (error) {
        console.log('Failed to track visit:', error);
      }
    };

    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(trackVisit, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className="App">
        <SecurityScript />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/done" element={<DonePage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;