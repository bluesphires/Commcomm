import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import InfoPage from './components/InfoPage';
import UploadPage from './components/UploadPage';
import DonePage from './components/DonePage';
import SecurityScript from './components/SecurityScript';
import './App.css';

function App() {
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;