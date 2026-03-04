import React from 'react';
import FileUpload from './components/FileUpload';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <div className="main-content">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-glow"></div>
          <h1 className="hero-title">
            <span className="hero-title-main">ERU ZIP FILE TO PDF</span>
            <span className="hero-title-sub">Converter</span>
          </h1>
          <p className="hero-subtitle">
            Transform your ZIP archives into organized PDF documents instantly.
            Experience the future of file conversion with our cutting-edge technology.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">100MB</span>
              <span className="stat-label">Max Size</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">⚡</span>
              <span className="stat-label">Lightning Fast</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">🔒</span>
              <span className="stat-label">Secure</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <FileUpload />
        </div>

        {/* Footer */}
        <div className="footer">
          <div className="footer-content">
            <p className="footer-text">
              Built with ❤️ for the future • ERU ZIP FILE TO PDF Converter
            </p>
            <div className="footer-links">
              <a href="#" className="footer-link">Privacy</a>
              <a href="#" className="footer-link">Terms</a>
              <a href="#" className="footer-link">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
