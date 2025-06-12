import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Home() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notif, setNotif] = useState('');

  // Ambil API URL dari env
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserName(name);
    setIsLoggedIn(!!localStorage.getItem('userToken'));
  }, []);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedExtensions = ['doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg'];
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (allowedExtensions.includes(fileExtension)) {
        setNotif('Mohon tunggu sebentar, file sedang ter-upload...');

        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch(`${API_URL}/api/files/upload`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Gagal upload file ke server');
          }

          const data = await response.json();
          const fileData = {
            name: data.originalname,
            size: file.size,
            type: file.type,
            path: `/uploads/${data.filename}`,
            uploadedBy: 1,
          };
          localStorage.setItem('uploadedFile', JSON.stringify(fileData));
          setNotif('Sukses di-upload!');
          setTimeout(() => setNotif(''), 1500);
          navigate('/halaman');
        } catch (error) {
          console.error('Terjadi kesalahan:', error);
          setNotif('Gagal upload file ke server.');
          setTimeout(() => setNotif(''), 2000);
        }
      } else {
        setNotif('Hanya file Word, Excel, dan JPG yang dapat diunggah.');
        setTimeout(() => setNotif(''), 2000);
      }
    }
  };

  const handleLogin = () => navigate('/login');
  const handleSignUp = () => navigate('/signup');
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUserName('');
    navigate('/');
  };
  const handleProfileClick = () => navigate('/profil');

  return (
    <div className="container">
      <div className="logo-area">
        <h1><span className="highlight">PDF</span> Kita</h1>
        <div className="slogan">Menyelesaikan Pekerjaan<br />Anda Dengan Mudah</div>
      </div>

      <div className="auth-buttons">
        {!isLoggedIn ? (
          <>
            <button onClick={handleLogin} className="auth-btn">Login</button>
            <button onClick={handleSignUp} className="auth-btn">Sign Up</button>
          </>
        ) : (
          <button onClick={handleLogout} className="auth-btn">Logout</button>
        )}
      </div>

      {isLoggedIn && (
        <div className="user-profile" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
          <span className="profile-icon">{userName ? userName.charAt(0).toUpperCase() : 'U'}</span>
          <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.1rem' }}>Halo, {userName}!</span>
        </div>
      )}

      <div className="main-content">
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
        <h2 className="download-title">File Converter</h2>
        <p className="download-subtitle">Masukkan File word, excel, JPG dan Nikmati hasil Converternya</p>
        <input
          type="file"
          accept=".doc,.docx,.xls,.xlsx,.jpg,.jpeg"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button className="download-btn" onClick={handleButtonClick}>Select File Anda</button>
        <p className="drop-text">Drop Your <strong>FILE</strong></p>
      </div>

      <div className="sidebar">
        <p className="sidebar-slogan">Menyelesaikan Pekerjaan<br />Anda Dengan Mudah</p>
        <h2 className="sidebar-thanks">WELCOME<br />To<br />PDF Kita</h2>
      </div>
    </div>
  );
}

export default Home;