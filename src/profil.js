import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './profil.css';

const API_URL = process.env.REACT_APP_API_URL;

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
      fetch(`${API_URL}/api/users/by-username/${encodeURIComponent(name)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.email) setEmail(data.email);
        })
        .catch(() => setEmail(''));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    navigate('/');
  };

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

  const handleHideFiles = () => {
    setShowFiles(false);
  };

  const handleBackToSlide = () => {
    navigate('/');
  };

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
        setSavedFiles([]);
        localStorage.setItem(key, JSON.stringify([]));
      }
    }
  };

  const normalizeUrl = (url) => {
    if (!url) return '';
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
        return `${API_URL}${parsedUrl.pathname}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const handleRedownload = (file) => {
    let url = '';

    if (file.path) {
      url = `${API_URL}${file.path}`;
    } else {
      const uploadedFile = localStorage.getItem('uploadedFile');
      if (uploadedFile) {
        try {
          const parsed = JSON.parse(uploadedFile);
          const found = Array.isArray(parsed)
            ? parsed.find(f => f.name === file.name)
            : (parsed.name === file.name ? parsed : null);
          if (found && found.path) {
            url = `${API_URL}${found.path}`;
          }
        } catch {}
      }
    }

    if (!url) {
      url = localStorage.getItem('selectedFile');
    }

    if (!url) {
      alert('File tidak ditemukan untuk diunduh.');
      return;
    }

    const finalUrl = normalizeUrl(url);

    const link = document.createElement('a');
    link.href = finalUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="profil-container">
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
                            onClick={() => handleRedownload(file)}
                          >
                            Unduh
                          </button>
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