import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './regis.css';

// ✅ Ambil API URL dari environment
const API_URL = process.env.REACT_APP_API_URL;

function Regis() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setFormData({ username: '', email: '', password: '' });
        navigate('/login');
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal registrasi');
      }
    } catch (error) {
      console.error('Error saat registrasi:', error);
      alert('Terjadi kesalahan saat registrasi');
    }
  };

  return (
    <div className="wrapper">
      <div className="header">
        <div>
          <h1><span className="highlight">PDF</span> Kita</h1>
          <p>Menyelesaikan Pekerjaan Anda Dengan Mudah</p>
        </div>
      </div>
      <div className="form-container">
        <h2>Sign Up</h2>
        <p>Silahkan daftar akun kamu</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Nama</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Masukkan nama"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Masukkan email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Masukkan password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="submit-btn">Simpan</button>
        </form>
      </div>
      <div className="right-sidebar">
        <p className="desc">Menyelesaikan Pekerjaan Anda Dengan Mudah</p>
        <h2 className="welcome">WELCOME<br />To<br />PDF Kita</h2>
      </div>
    </div>
  );
}

export default Regis;