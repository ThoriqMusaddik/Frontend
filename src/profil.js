import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './profil.css';

function Profil() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [showFiles, setShowFiles] = useState(false);
  const [savedFiles, setSavedFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) {
      setUserName(name);
      // Ambil email dari backend
      fetch(`http://localhost:5000/api/users/by-username/${encodeURIComponent(name)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.email) setEmail(data.email);
        })
        .catch(() => setEmail(''));
    }
  }, []);

  // Handler untuk logout
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    navigate('/');
  };

  // Handler untuk menampilkan file tersimpan
  const handleShowFiles = () => {
    const userName = localStorage.getItem('userName') || 'default';
    const key = `downloadedFiles_${userName}`;
    const downloads = localStorage.getItem(key);
    if (downloads) {
      try {
        const parsed = JSON.parse(downloads);
        setSavedFiles(Array.isArray(parsed) ? parsed : [parsed]);
      } catch {
        setSavedFiles([]);
      }
    } else {
      setSavedFiles([]);
    }
    setShowFiles(true);
  };

  // Handler untuk kembali ke form profil
  const handleHideFiles = () => {
    setShowFiles(false);
  };

  // Handler untuk tombol back to slide
  const handleBackToSlide = () => {
    navigate('/');
  };

  // Fungsi hapus file dari daftar tersimpan
  const handleDeleteFile = (fileName) => {
    const userName = localStorage.getItem('userName') || 'default';
    const key = `downloadedFiles_${userName}`;
    const downloads = localStorage.getItem(key);
    if (downloads) {
      try {
        const parsed = JSON.parse(downloads);
        const filtered = Array.isArray(parsed)
          ? parsed.filter(f => f.name !== fileName)
          : [];
        setSavedFiles(filtered);
        localStorage.setItem(key, JSON.stringify(filtered));
      } catch {
        // Jika gagal parsing, reset saja
        setSavedFiles([]);
        localStorage.setItem(key, JSON.stringify([]));
      }
    }
  };

  return (
    <div className="profil-container">
      {/* Tombol Back to Slide pojok kanan atas */}
      <button className="back-to-slide-btn" onClick={handleBackToSlide}>
        Back to Slide
      </button>
      <div className="profil-sidebar">
        <img
          src="https://randomuser.me/api/portraits/women/44.jpg"
          alt="Profile"
          className="profil-photo"
        />
        <div className="profil-hello">
          <span className="profil-hello-text">
            <span className="profil-hello-highlight">
              Hello {userName || 'User'}
            </span>
          </span>
        </div>
        <button
          className="profil-btn"
          onClick={handleHideFiles}
          disabled={!showFiles}
        >
          Biodata Diri
        </button>
        <button
          className={`profil-btn ${showFiles ? 'active' : ''}`}
          onClick={handleShowFiles}
        >
          File Tersimpan
        </button>
        <button className="profil-logout" onClick={handleLogout}>
          Logout <span className="profil-logout-icon">&#x1F6AA;</span>
        </button>
      </div>
      <div className="profil-main">
        {!showFiles ? (
          <form className="profil-form">
            <div className="profil-form-row">
              <label>Nama :</label>
              <input type="text" className="profil-input" value={userName} readOnly />
            </div>
            <div className="profil-form-row">
              <label>Email :</label>
              <input type="email" className="profil-input" value={email} readOnly />
            </div>
          </form>
        ) : (
          <div className="saved-files-table-container">
            <table className="saved-files-table">
              <thead>
                <tr>
                  <th>Nama File</th>
                  <th>Date</th>
                  <th>Download Again</th>
                </tr>
              </thead>
              <tbody>
                {savedFiles.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>Tidak ada file tersimpan.</td>
                  </tr>
                ) : (
                  savedFiles.map((file, idx) => (
                    <tr key={idx}>
                      <td>{file.name}</td>
                      <td>{file.date ? new Date(file.date).toLocaleString() : '-'}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <span>
                            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : '-'}
                          </span>
                          <button
                            className="profil-download-btn"
                            style={{
                              marginTop: '6px',
                              padding: '4px 14px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#e74c3c',
                              color: '#fff',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              // Coba ambil dari uploads jika ada path, fallback ke localStorage
                              let url = '';
                              if (file.path) {
                                url = `http://localhost:5000${file.path}`;
                              } else {
                                // Coba cari di localStorage uploadedFile
                                const uploadedFile = localStorage.getItem('uploadedFile');
                                if (uploadedFile) {
                                  try {
                                    const parsed = JSON.parse(uploadedFile);
                                    const found = Array.isArray(parsed)
                                      ? parsed.find(f => f.name === file.name)
                                      : (parsed.name === file.name ? parsed : null);
                                    if (found && found.path) {
                                      url = `http://localhost:5000${found.path}`;
                                    }
                                  } catch {}
                                }
                              }
                              // Jika tidak ada url, fallback ke selectedFile
                              if (!url) {
                                url = localStorage.getItem('selectedFile');
                              }
                              // Jika tetap tidak ada, alert
                              if (!url) {
                                alert('File tidak ditemukan untuk diunduh.');
                                return;
                              }
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = file.name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            Unduh
                          </button>
                          {/* Tombol Delete */}
                          <button
                            className="profil-delete-btn"
                            style={{
                              marginTop: '6px',
                              padding: '4px 14px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#888',
                              color: '#fff',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleDeleteFile(file.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profil;