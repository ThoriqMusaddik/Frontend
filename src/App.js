import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home'; // Halaman utama
import Halaman from './halaman'; // Halaman konversi
import Download from './download'; // Halaman unduh
import Regis from './regis'; // Halaman registrasi
import Login from './login'; // Halaman login
import NotLogin from './notlogin'; // Tambahkan import ini
import Profil from './profil'; // import profil.js

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/halaman" element={<Halaman />} />
        <Route path="/download" element={<Download />} />
        <Route path="/signup" element={<Regis />} /> {/* Route untuk registrasi */}
        <Route path="/login" element={<Login />} /> {/* Route untuk login */}
        <Route path="/notlogin" element={<NotLogin />} /> {/* Tambahkan ini */}
        <Route path="/profil" element={<Profil />} />
      </Routes>
    </Router>
  );
}

export default App;
