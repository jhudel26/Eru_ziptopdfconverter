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
        className={`upload-zone glass-card rounded-xl p-8 mb-6 text-center cursor-pointer transition-all duration-300 ${
          selectedFile ? 'border-blue-400' : 'border-gray-400'
        }`}
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
          <div className="animate-fade-in">
            <File className="mx-auto mb-4 text-blue-400" size={48} />
            <p className="text-lg font-semibold text-white mb-2">{selectedFile.name}</p>
            <p className="text-gray-300 mb-4">{formatFileSize(selectedFile.size)}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <Upload className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-xl font-semibold text-white mb-2">Drop your ZIP file here</p>
            <p className="text-gray-300 mb-4">or click to browse files</p>
            <p className="text-sm text-gray-400">Supports ZIP archives up to 100MB</p>
          </div>
        )}
      </div>

      {/* Convert Button */}
      {selectedFile && !isConverting && (
        <div className="text-center mb-6">
          <button
            onClick={handleUpload}
            className="btn-primary bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Convert to PDF
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {isConverting && (
        <div className="mb-6">
          <div className="glass-card-small rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Converting...</span>
              <span className="text-gray-300">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="progress-bar bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message & Download */}
      {success && (
        <div className="mb-6">
          <div className="glass-card-small rounded-lg p-4 border border-green-500">
            <div className="flex items-center">
              <CheckCircle className="text-green-400 mr-3" size={24} />
              <div>
                <p className="text-green-400 font-medium">{success}</p>
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    className="inline-flex items-center mt-2 text-blue-400 hover:text-blue-300 transition-colors"
                    download
                  >
                    <Download size={16} className="mr-2" />
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <div className="glass-card-small rounded-lg p-4 border border-red-500">
            <div className="flex items-center">
              <AlertCircle className="text-red-400 mr-3" size={24} />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
