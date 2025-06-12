import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './halaman.css';

const API_URL = process.env.REACT_APP_API_URL;

function Halaman() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingJpg, setIsLoadingJpg] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [notif, setNotif] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    setIsLoggedIn(!!token);
    if (token) localStorage.removeItem('guestConvertCount');

    const uploadedFile = localStorage.getItem('uploadedFile');
    if (uploadedFile) {
      try {
        const parsed = JSON.parse(uploadedFile);
        setUploadedFiles(Array.isArray(parsed) ? parsed : [parsed]);
      } catch {
        setUploadedFiles([]);
      }
    }
  }, []);

  const checkGuestLimit = () => {
    if (!isLoggedIn) {
      const count = Number(localStorage.getItem('guestConvertCount') || 0);
      if (count >= 1) {
        setNotif('Silahkan login terlebih dahulu untuk melanjutkan.');
        return false;
      }
      localStorage.setItem('guestConvertCount', count + 1);
    }
    return true;
  };

  const handleAddFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedExtensions = ['doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setNotif('Hanya file Word, Excel, dan JPG yang dapat diunggah.');
      setTimeout(() => setNotif(''), 2000);
      return;
    }

    setNotif('Sedang mengupload file...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/files/upload`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Gagal upload file');
      const data = await response.json();

      const newFile = {
        name: data.originalname,
        size: file.size,
        type: file.type,
        path: `/uploads/${data.filename}`,
        uploadedBy: 1,
      };

      const updatedFiles = [...uploadedFiles, newFile];
      setUploadedFiles(updatedFiles);
      localStorage.setItem('uploadedFile', JSON.stringify(updatedFiles));
      setNotif('Berhasil upload file!');
    } catch (err) {
      console.error(err);
      setNotif('Gagal upload file.');
    } finally {
      setTimeout(() => setNotif(''), 1500);
    }
  };

  const handleDelete = async (fileName) => {
    try {
      const response = await fetch(`${API_URL}/api/files/${encodeURIComponent(fileName)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal hapus file');
      const updated = uploadedFiles.filter(file => file.name !== fileName);
      setUploadedFiles(updated);
      localStorage.setItem('uploadedFile', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus file');
    }
  };

  const handleConvert = async (type) => {
    if (!checkGuestLimit()) return;
    if (!uploadedFiles.length) return alert('Pilih file terlebih dahulu!');

    const fileMeta = uploadedFiles[0];
    const extension = fileMeta.name.split('.').pop().toLowerCase();

    const rules = {
      word: ['doc', 'docx'],
      excel: ['xls', 'xlsx'],
      jpg: ['jpg', 'jpeg']
    };

    if (!rules[type].includes(extension)) {
      return alert(`Pilih file ${type.toUpperCase()} yang sesuai!`);
    }

    const endpointMap = {
      word: '/api/convert/word-to-pdf',
      excel: '/api/convert/excel-to-pdf',
      jpg: '/api/convert/jpg-to-pdf'
    };

    try {
      if (type === 'jpg') {
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoadingJpg(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch(`${API_URL}${endpointMap[type]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: fileMeta.name }),
      });

      if (!response.ok) throw new Error('Konversi gagal');
      const data = await response.json();

      localStorage.setItem('selectedFile', data.fileUrl);
      localStorage.setItem('selectedFileName', fileMeta.name.replace(/\.[^/.]+$/, '') + '.pdf');
      navigate('/download');
    } catch (err) {
      console.error(err);
      alert('Konversi gagal: ' + err.message);
    } finally {
      setIsLoading(false);
      setIsLoadingJpg(false);
    }
  };

  return (
    <div className="header">
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 20 }}>
        <button className="back-button" onClick={() => navigate('/')}>← Back to Home</button>
      </div>

      <div className="halaman-content">
        {notif && (
          <div style={{
            background: '#fffae6',
            color: '#e67e22',
            padding: '10px 20px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontWeight: 'bold',
            border: '1px solid #ffe0b2'
          }}>{notif}</div>
        )}

        <h2 className="halaman-title">Choose Your File</h2>
        <p className="halaman-subtitle">Pilih file converter kamu!</p>

        <div className="button-container">
          <button className="convert-button" onClick={() => handleConvert('word')} disabled={isLoading || isLoadingJpg}>Word To PDF</button>
          <button className="convert-button" onClick={() => handleConvert('excel')} disabled={isLoading || isLoadingJpg}>Excel To PDF</button>
          <button className="convert-button" onClick={() => handleConvert('jpg')} disabled={isLoading || isLoadingJpg}>
            {isLoadingJpg ? 'Tunggu Sebentar...' : 'JPG To PDF'}
          </button>
        </div>

        <div className="uploaded-files">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="uploaded-file">
              <span className="uploaded-file-name">{file.name}</span>
              <button className="delete-btn" onClick={() => handleDelete(file.name)}>Delete</button>
            </div>
          ))}
        </div>

        {(isLoading || isLoadingJpg) && <div className="loading-spinner">Loading...</div>}

        {isLoggedIn && (
          <>
            <button className="upload-btn" onClick={handleAddFile}>Tambahkan File</button>
            <input type="file" accept=".doc,.docx,.xls,.xlsx,.jpg,.jpeg" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
          </>
        )}
      </div>
    </div>
  );
}

export default Halaman;