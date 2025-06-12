import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const API_URL = process.env.REACT_APP_API_URL;

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Login berhasil!');
        localStorage.setItem('userToken', result.token);
        localStorage.setItem('userName', result.user?.username || 'User');
        navigate('/');
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal login');
      }
    } catch (error) {
      console.error('Error saat login:', error);
      alert('Terjadi kesalahan saat login');
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
        <h2>Login</h2>
        <p>Silahkan masuk menggunakan akun kamu</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="Masukkan email" value={formData.email} onChange={handleChange} required />
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Masukkan password" value={formData.password} onChange={handleChange} required />
          <button type="submit" className="submit-btn">Masuk</button>
        </form>
      </div>
      <div className="right-sidebar">
        <p className="desc">Menyelesaikan Pekerjaan Anda Dengan Mudah</p>
        <h2 className="welcome">WELCOME<br />To<br />PDF Kita</h2>
      </div>
    </div>
  );
}

export default Login;