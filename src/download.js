import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './download.css';

const API_URL = process.env.REACT_APP_API_URL;

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
    if (!fileUrl) return;

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    saveDownloadMetadata();
  };

  const saveDownloadMetadata = () => {
    let size = null;
    try {
      const uploadedFile = localStorage.getItem('uploadedFile');
      if (uploadedFile) {
        const parsed = JSON.parse(uploadedFile);
        const found = Array.isArray(parsed)
          ? parsed.find(f => f.name === fileName)
          : (parsed.name === fileName ? parsed : null);
        if (found && found.size) size = found.size;
      }
    } catch (err) {
      console.error("Gagal parsing uploadedFile:", err);
    }

    const userName = localStorage.getItem('userName') || 'guest';
    const key = `downloadedFiles_${userName}`;
    const downloadedFiles = JSON.parse(localStorage.getItem(key) || '[]');

    const newFile = {
      name: fileName,
      date: new Date().toISOString(),
      size: size,
    };
    downloadedFiles.push(newFile);
    localStorage.setItem(key, JSON.stringify(downloadedFiles));

    // Kirim log download ke backend (endpoint tersendiri)
    sendDownloadLogToBackend(userName, newFile);
  };

  const sendDownloadLogToBackend = async (userName, fileData) => {
    try {
      const response = await fetch(`${API_URL}/api/files/log-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileData.name,
          userName: userName,
          size: fileData.size,
          date: fileData.date
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal kirim log download');
      }
    } catch (err) {
      console.error('Gagal mengirim log download:', err);
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="download-update-root">
      <div className="full-width-header">
        <div className="download-update-logo">
          <span className="download-update-logo-bold">PDF</span> Kita
        </div>
        <div className="download-update-slogan">
          Menyelesaikan Pekerjaan<br />Anda Dengan Mudah
        </div>
        <button className="download-update-home" onClick={handleHomeClick}>HOME</button>
      </div>

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

      <div className="download-update-footer">
        Create By @kelompok_1
      </div>
    </div>
  );
}

export default Download;