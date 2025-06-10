import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // ← Tambahkan baris ini
import './halaman.css';

const API_URL = process.env.REACT_APP_API_URL;

function Halaman() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [notif, setNotif] = useState('');
  const [isLoadingJpg, setIsLoadingJpg] = useState(false); // Tambahkan state baru
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    setIsLoggedIn(!!token);

    // Reset guestConvertCount jika login
    if (token) {
      localStorage.removeItem('guestConvertCount');
    }

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

  const handleDelete = (fileName) => {
    fetch(`http://localhost:5000/api/files/${encodeURIComponent(fileName)}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) throw new Error('Gagal menghapus file di database');
        const updatedFiles = uploadedFiles.filter((file) => file.name !== fileName);
        setUploadedFiles(updatedFiles);
        localStorage.setItem('uploadedFile', JSON.stringify(updatedFiles));
      })
      .catch((error) => {
        console.error('Terjadi kesalahan:', error);
        alert('Gagal menghapus file di database.');
      });
  };

  const handleAddFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedExtensions = ['doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg'];
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (allowedExtensions.includes(fileExtension)) {
        setNotif('Mohon tunggu sebentar, file sedang ter-upload...');
        const formData = new FormData();
        formData.append('file', file);

        fetch(`${API_URL}/api/files/upload`, {
          method: 'POST',
          body: formData,
        })
          .then((response) => {
            if (!response.ok) throw new Error('Gagal upload file ke server');
            return response.json();
          })
          .then((data) => {
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
            setNotif('Sukses di-upload!');
            setTimeout(() => setNotif(''), 1500);
          })
          .catch((error) => {
            console.error('Terjadi kesalahan:', error);
            setNotif('Gagal upload file ke server.');
            setTimeout(() => setNotif(''), 2000);
          });
      } else {
        setNotif('Hanya file Word, Excel, dan JPG yang dapat diunggah.');
        setTimeout(() => setNotif(''), 2000);
      }
    }
  };

  // Tambahkan fungsi pengecekan guest limit
  const checkGuestLimit = () => {
    if (!isLoggedIn) {
      const count = Number(localStorage.getItem('guestConvertCount') || 0);
      if (count >= 1) {
        setNotif('maaf login dulu bro');
        return false;
      }
      localStorage.setItem('guestConvertCount', count + 1);
    }
    return true;
  };

  const handleConvertWordToPdf = async () => {
    if (!checkGuestLimit()) return;

    if (!uploadedFiles.length) return alert('Pilih file dulu!');
    const fileMeta = uploadedFiles[0];
    const allowedExtensions = ['doc', 'docx'];
    const fileExtension = fileMeta.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return alert('Pilih file Word (.doc/.docx) untuk dikonversi ke PDF!');
    }

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/convert/word-to-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: fileMeta.name }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      localStorage.setItem('selectedFile', data.fileUrl);
      localStorage.setItem('selectedFileName', fileMeta.name.replace(/\.[^/.]+$/, '') + '.pdf');
      navigate('/download');
    } catch (error) {
      console.error('Konversi gagal:', error);
      alert('Konversi gagal: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertExcelToPdf = async () => {
    if (!checkGuestLimit()) return;

    if (!uploadedFiles.length) return alert('Pilih file dulu!');
    const fileMeta = uploadedFiles[0];
    const allowedExtensions = ['xls', 'xlsx'];
    const fileExtension = fileMeta.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return alert('Pilih file Excel (.xls/.xlsx) untuk dikonversi ke PDF!');
    }

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/convert/excel-to-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: fileMeta.name }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      localStorage.setItem('selectedFile', data.fileUrl);
      localStorage.setItem('selectedFileName', fileMeta.name.replace(/\.[^/.]+$/, '') + '.pdf');
      navigate('/download');
    } catch (error) {
      console.error('Konversi gagal:', error);
      alert('Konversi gagal: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertJpgToPdf = async () => {
    if (!checkGuestLimit()) return;

    if (!uploadedFiles.length) return alert('Pilih file dulu!');
    const fileMeta = uploadedFiles[0];
    const allowedExtensions = ['jpg', 'jpeg'];
    const fileExtension = fileMeta.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return alert('Pilih file JPG untuk dikonversi ke PDF!');
    }

    try {
      // Tambahkan delay 0.5 detik sebelum setIsLoadingJpg(true)
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoadingJpg(true);

      const response = await fetch('http://localhost:5000/api/convert/jpg-to-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: fileMeta.name }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      localStorage.setItem('selectedFile', data.fileUrl);
      localStorage.setItem('selectedFileName', fileMeta.name.replace(/\.[^/.]+$/, '') + '.pdf');
      navigate('/download');
    } catch (error) {
      console.error('Konversi gagal:', error);
      alert('Konversi gagal: ' + error.message);
    } finally {
      setIsLoadingJpg(false); // Reset loading JPG
    }
  };

  return (
    <div className="header">
      {/* Header kiri atas */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 20 }}>
        <button className="back-button" onClick={() => navigate('/')}>← Back to Home</button>
      </div>

      <div className="halaman-content">
        {/* Notifikasi upload */}
        {notif && (
          <div style={{
            background: '#fffae6',
            color: '#e67e22',
            padding: '10px 20px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontWeight: 'bold',
            border: '1px solid #ffe0b2'
          }}>
            {notif}
          </div>
        )}
        <h2 className="halaman-title">Choose Your File</h2>
        <p className="halaman-subtitle">Pilih File converter kamu!</p>

        <div className="button-container">
          <button className="convert-button" onClick={handleConvertWordToPdf} disabled={isLoading || isLoadingJpg}>Word To PDF</button>
          <button className="convert-button" onClick={handleConvertExcelToPdf} disabled={isLoading || isLoadingJpg}>Excel To PDF</button>
          <button
            className="convert-button"
            onClick={handleConvertJpgToPdf}
            disabled={isLoadingJpg || isLoading}
          >
            {isLoadingJpg ? (
              <>
                <span className="loading-spinner" style={{ marginRight: 8 }} />
                Tunggu sebentar...
              </>
            ) : (
              'JPG To PDF'
            )}
          </button>
        </div>

        <div className="uploaded-files">
          {uploadedFiles.length > 0 && uploadedFiles.map((file, index) => (
            <div key={index} className="uploaded-file">
              <span className="uploaded-file-name">{file.name}</span>
              <button className="delete-btn" onClick={() => handleDelete(file.name)}>Delete</button>
            </div>
          ))}
        </div>

        {isLoading && <div className="loading-spinner">Loading</div>}

        {isLoggedIn && (
          <>
            <button className="upload-btn" onClick={handleAddFile}>Tambahkan File</button>
            <input
              type="file"
              accept=".doc,.docx,.xls,.xlsx,.jpg,.jpeg"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Halaman;