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
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Zone */}
      <div
        className="upload-zone"
        onClick={() => fileInputRef.current?.click()}
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
          <div>
            <File className="upload-icon" />
            <p className="upload-title">{selectedFile.name}</p>
            <p className="upload-subtitle">{formatFileSize(selectedFile.size)}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="clear-file"
            >
              <X size={16} className="inline mr-1" />
              Remove
            </button>
          </div>
        ) : (
          <div>
            <div className="upload-icon">⬆️</div>
            <p className="upload-title">Drop your ZIP file here</p>
            <p className="upload-subtitle">or click to browse files</p>
            <div className="upload-limit">Supports ZIP archives up to 100MB</div>
          </div>
        )}
      </div>

      {/* Convert Button */}
      {selectedFile && !isConverting && (
        <div className="text-center mb-8">
          <button
            onClick={handleUpload}
            className="convert-button"
          >
            Convert to PDF
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {isConverting && (
        <div className="progress-container">
          <div className="progress-header">
            <span className="progress-title">Converting...</span>
            <span className="progress-percentage">{progress}%</span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Success Message & Download */}
      {success && (
        <div className="success-container">
          <div className="success-content">
            <CheckCircle className="success-icon" />
            <div className="success-text">
              <p className="success-title">{success}</p>
              <p className="success-message">Your PDF is ready for download</p>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  className="download-link"
                  download
                >
                  <Download size={16} />
                  Download PDF
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
            <AlertCircle className="error-icon" />
            <p className="error-text">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
