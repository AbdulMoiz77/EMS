import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavLink } from "react-router-dom";
import { Typography } from '@mui/material';
import "./update.css";

function Update(){
  const navigate = useNavigate();
  const location = useLocation();
  const {flag} = location.state || {flag: false};
  const hasAlerted = useRef(false);
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [fileSelected, setFileSelected] = useState(false);
  const [status, setStatus] = useState("No action taken");

  useEffect(() => {
    console.log(hasAlerted, flag);
    if (!flag && !hasAlerted.current) {
      console.log("Here");
      alert('Please login first.')
      hasAlerted.current = true;
      navigate('/login');
    }
  }, [flag, navigate]);

  const isBinFile = (file) => {
    return file && file.name.toLowerCase().endsWith('.bin');
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (isBinFile(selectedFile)) {
      setFile(selectedFile);
      setFileSelected(true);
      setStatus(`${selectedFile.name} selected`);
    } else {
      setStatus('Only .bin files are supported');
      e.target.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (isBinFile(droppedFile)) {
      setFile(droppedFile);
      setStatus(`${droppedFile.name} selected`);
    } else {
      setStatus('Only .bin files are supported');
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDelete = () => {
    setFile(null);
    setStatus('File removed');
    setFileSelected(false);
    fileRef.current.value = '';
  };

  const handleSubmit = () => {
    if (file) {
      setStatus('Update Completed');
    } else {
      setStatus('No file selected');
    }
  };

  return (
    <div className="file-wrapper">
      <NavLink to="/">
      <button className="home-button">
        <img src="/home.png" alt="Home" className="home-icon" />
      </button>
      </NavLink>

      <Typography variant="h4" gutterBottom   sx={{mr: 2, color: "#ebf2f1", fontFamily: "'Poppins', sans-serif", fontWeight: 'bold', fontSize: '2.5rem', letterSpacing: '2px' }}>
          Update Firmware OTA
      </Typography>
      <div className={`dropzone ${fileSelected ? 'fileSelected': ''}`} onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileRef.current.click()} >
        <input type="file" ref={fileRef} onChange={handleFileSelect} accept=".bin" style={{ display: 'none' }} />
        {file ? (
          <div className="file-info">
            <span>{file.name}</span>
            <button 
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              ✖
            </button>
          </div>
        ) : (
          <span>Drag and drop or browse .bin file</span>
        )}
      </div>

      <button className="submit-button" onClick={handleSubmit}>
        Submit
      </button>

      <p className="status">Status: {status}</p>
    </div>
  );
}
export default Update;



