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

        {/* Features Section */}
        <div className="features-section">
          <h2 className="features-title">Why Choose ERU?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🚀</div>
              </div>
              <h3 className="feature-title">Lightning Fast</h3>
              <p className="feature-description">
                Advanced algorithms process large ZIP files in seconds, delivering PDFs instantly with optimal performance.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🔒</div>
              </div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-description">
                Your files are processed securely with end-to-end encryption. No permanent storage, maximum privacy.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🎨</div>
              </div>
              <h3 className="feature-title">Modern Design</h3>
              <p className="feature-description">
                Experience cutting-edge UI with glassmorphism effects, smooth animations, and futuristic aesthetics.
              </p>
            </div>
          </div>
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
