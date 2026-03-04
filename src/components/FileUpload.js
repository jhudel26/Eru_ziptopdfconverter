import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, File, Download, AlertCircle, CheckCircle, X } from 'lucide-react';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.toLowerCase().endsWith('.zip')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select a valid ZIP file');
        setSelectedFile(null);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.toLowerCase().endsWith('.zip'))) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please drop a valid ZIP file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('archive', selectedFile);

    setIsConverting(true);
    setProgress(0);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        setSuccess('Conversion completed successfully!');
        setDownloadUrl(response.data.downloadUrl);
        setProgress(100);
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred during conversion');
      setProgress(0);
    } finally {
      setIsConverting(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError('');
    setSuccess('');
    setDownloadUrl('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-container">
      {/* Upload Zone */}
      <div
        className="upload-zone"
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".zip,application/zip,application/x-zip-compressed"
          className="hidden"
        />

        {selectedFile ? (
          <div className="selected-file-display">
            <div className="file-icon">📁</div>
            <div className="file-info">
              <h3 className="file-name">{selectedFile.name}</h3>
              <p className="file-size">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="clear-file"
              title="Remove file"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">⬆️</div>
            <div className="upload-text">
              <h3 className="upload-title">Drop your ZIP file here</h3>
              <p className="upload-subtitle">or click to browse files</p>
              <div className="upload-limit">Supports ZIP archives up to 100MB</div>
            </div>
          </div>
        )}
      </div>

      {/* Convert Button */}
      {selectedFile && !isConverting && (
        <div className="action-section">
          <button
            onClick={handleUpload}
            className="convert-button"
          >
            <span className="button-text">Convert to PDF</span>
            <span className="button-icon">⚡</span>
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {isConverting && (
        <div className="progress-container">
          <div className="progress-header">
            <span className="progress-title">Converting your file...</span>
            <span className="progress-percentage">{progress}%</span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-status">
            <span className="status-text">Processing archive and generating PDF</span>
          </div>
        </div>
      )}

      {/* Success Message & Download */}
      {success && (
        <div className="success-container">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <div className="success-text">
              <p className="success-title">{success}</p>
              <p className="success-message">Your PDF is ready for download</p>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  className="download-link"
                  download
                >
                  <span className="download-text">Download PDF</span>
                  <span className="download-icon">📥</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-container">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <p className="error-text">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
