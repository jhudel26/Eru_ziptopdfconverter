import React from 'react';
import FileUpload from './components/FileUpload';
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-glow" />
        <h1 className="hero-title">
          <span className="hero-title-main">ERU ZIP TO PDF</span>
          <span className="hero-title-sub">Employee Report Converter</span>
        </h1>
        <p className="hero-subtitle">
          Convert ZIP archives of reports into a single, well‑organized PDF in just a few seconds.
        </p>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <FileUpload />
      </div>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">
          ERU ZIP TO PDF · Files stay private and are removed shortly after processing.
        </p>
      </footer>
    </div>
  );
}

export default App;
