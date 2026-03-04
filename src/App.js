import React from 'react';
import FileUpload from './components/FileUpload';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ERU ZIP FILE TO PDF Converter
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform your ZIP archives into organized PDF documents instantly.
            Modern, fast, and secure file conversion.
          </p>
        </div>

        {/* Main Upload Component */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          <FileUpload />
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="glass-card-small rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-300 text-sm">Convert large ZIP files in seconds with optimized processing</p>
          </div>
          <div className="glass-card-small rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure & Private</h3>
            <p className="text-gray-300 text-sm">Your files are processed securely and never stored permanently</p>
          </div>
          <div className="glass-card-small rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-lg font-semibold text-white mb-2">Modern UI</h3>
            <p className="text-gray-300 text-sm">Beautiful glassmorphism design with smooth animations</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
