import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './download.css';

function Download() {
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('download.pdf');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUrl = localStorage.getItem('selectedFile');
    const storedName = localStorage.getItem('selectedFileName');
    if (storedUrl) {
      setFileUrl(storedUrl);
      setFileName(storedName || 'download.pdf');
    } else {
      setFileUrl('');
      setFileName('');
    }
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Simpan metadata file download ke localStorage
    let size = null;
    const uploadedFile = localStorage.getItem('uploadedFile');
    if (uploadedFile) {
      try {
        const parsed = JSON.parse(uploadedFile);
        const found = Array.isArray(parsed)
          ? parsed.find(f => f.name === fileName)
          : (parsed.name === fileName ? parsed : null);
        if (found && found.size) size = found.size;
      } catch {}
    }

    const userName = localStorage.getItem('userName') || 'default';
    const key = `downloadedFiles_${userName}`;
    const downloadedFiles = JSON.parse(localStorage.getItem(key) || '[]');
    downloadedFiles.push({
      name: fileName,
      date: new Date().toISOString(),
      size: size,
    });
    localStorage.setItem(key, JSON.stringify(downloadedFiles));

    const API_URL = process.env.REACT_APP_API_URL;
    fetch(`${API_URL}/api/files/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        userName: localStorage.getItem('userName') || null,
        size: size,
      }),
    });
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="download-update-root">
      {/* Header Merah */}
      <div className="full-width-header">
        <div className="download-update-logo">
          <span className="download-update-logo-bold">PDF</span> Kita
        </div>
        <div className="download-update-slogan">
          Menyelesaikan Pekerjaan<br />Anda Dengan Mudah
        </div>
        <button className="download-update-home" onClick={handleHomeClick}>HOME</button>
      </div>

      {/* Konten Tengah */}
      <div className="download-update-content">
        <div className="download-update-title">
          <strong>Download Your File</strong>
        </div>
        <div className="download-update-desc">
          Terimakasih mudah simpel dan praktis
        </div>
        {fileUrl ? (
          <button className="download-update-btn" onClick={handleDownload}>
            DOWNLOAD HERE
          </button>
        ) : (
          <p>Tidak ada file untuk diunduh.</p>
        )}
      </div>

      {/* Footer */}
      <div className="download-update-footer">
        Create By @kelompok_1
      </div>
    </div>
  );
}

export default Download;