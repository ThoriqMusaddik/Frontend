import React, { useEffect, useState, useRef } from 'react';
import './notlogin.css';

function Halaman() {
  const [uploadedFiles, setUploadedFiles] = useState([]); // Daftar file yang diunggah
  const fileInputRef = useRef(null); // Referensi untuk input file

  useEffect(() => {
    // Ambil file yang diunggah dari localStorage
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

  // Fungsi untuk membuka dialog upload file
  const handleAddFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // reset input supaya bisa upload file yang sama berulang
      fileInputRef.current.click();
    }
  };

  // Fungsi untuk menangani perubahan file input (upload file)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedExtensions = ['pdf'];
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        alert('Hanya file PDF yang dapat diunggah.');
        return;
      }

      // Upload file ke server
      const formData = new FormData();
      formData.append('file', file);

      fetch('http://localhost:5000/api/files/upload', {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (!response.ok) throw new Error('Gagal upload file ke server');
          return response.json();
        })
        .then((data) => {
          // data.filename diasumsikan nama file hasil upload di server
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
          alert('File berhasil diupload!');
        })
        .catch((error) => {
          console.error('Terjadi kesalahan:', error);
          alert('Gagal upload file ke server.');
        });
    }
  };

  // Fungsi untuk menghapus file yang sudah diupload
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

  return (
    <div className="halaman-root">
      <div className="halaman-content">
        <h2 className="halaman-title">Choose Your File</h2>
        <p className="halaman-subtitle">Pilih File converter kamu!</p>

        <div className="button-container">
          <button className="convert-button">PDF To Word</button>
          <button className="convert-button">PDF To Excel</button>
          <button className="convert-button">PDF To JPG</button>
        </div>

        {/* Tombol Upload File */}
        <button onClick={handleAddFile} style={{ marginTop: '20px' }}>
          Upload File PDF
        </button>

        {/* Input file tersembunyi */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept=".pdf"
        />

        {/* Tampilkan list file yang sudah diupload */}
        <ul>
          {uploadedFiles.map((file) => (
            <li key={file.name}>
              {file.name}{' '}
              <button onClick={() => handleDelete(file.name)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Halaman;