import React from 'react';
import FileUpload from './components/FileUpload';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <div className="main-content">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">ERU ZIP FILE TO PDF Converter</h1>
          <p className="hero-subtitle">
            Transform your ZIP archives into organized PDF documents instantly.
            Modern, fast, and secure file conversion.
          </p>
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <FileUpload />
        </div>

        {/* Features Section */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Lightning Fast</h3>
            <p className="feature-description">
              Convert large ZIP files in seconds with optimized processing and advanced algorithms
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Secure & Private</h3>
            <p className="feature-description">
              Your files are processed securely and never stored permanently. End-to-end encryption
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3 className="feature-title">Modern Design</h3>
            <p className="feature-description">
              Beautiful glassmorphism interface with smooth animations and futuristic aesthetics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
