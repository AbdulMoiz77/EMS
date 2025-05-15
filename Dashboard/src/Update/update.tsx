import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavLink } from "react-router-dom";
import { Typography } from '@mui/material';
import { database } from '../firebase/config';
import { ref, set, get, onValue } from 'firebase/database';
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
  const [uploaded, setUploaded] = useState(false);
  const [deleteShow, setDeleteShow] = useState(true);

  useEffect(() => {
    if (!flag && !hasAlerted.current) {
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

  const handleSubmit = async () => {
    if (file) {
      setStatus('Uploading to drive');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploadToDrive', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if(result.success){
        setStatus('Upload complete');
        setUploaded(true);
        setDeleteShow(false);
      }


    } else {
      setStatus('No file selected');
    }
  };

  const handleUpdate = async () => {
  const updateRef = ref(database, 'Firmware/update');
  const statusRef = ref(database, 'Firmware/status' );
  let statusValue = ""

  try {
    const snapshot = await get(statusRef);
    if(snapshot.exists()){
      statusValue = snapshot.val();
      console.log('Firmware status:', statusValue);
    }

    await set(updateRef, true);
    setStatus('Changed the update flag');

    const firmwareRef = ref(database, 'Firmware');

    const intervalId = setInterval(async () => {
      try {
        const snapshot = await get(firmwareRef);
        if (!snapshot.exists()) return;

        const data = snapshot.val();

        if ('status' in data) {
          if(data.status != statusValue){
            setStatus(data.status);
          }
        }

        if ('update' in data && data.update === false) {

          const snapshot = await get(statusRef);
          if(snapshot.exists()){
            const statusValue = snapshot.val();
            console.log('Firmware status:', statusValue);
          }

          clearInterval(intervalId);
          setTimeout(async () => {
            const snapshot = await get(statusRef);
            if(snapshot.exists()){
              const statusValue = snapshot.val();
              console.log('Firmware status:', statusValue);
            }
            setDeleteShow(true);
            setUploaded(false);
            setFile(null);
            setFileSelected(false);
            fileRef.current.value = '';
            setStatus(statusValue);
            setTimeout(() => {
              setStatus("No action taken");
            }, 5000);
          }, 5000);
        }
      } catch (err) {
        console.error('Error fetching firmware data:', err);
        clearInterval(intervalId);
      }
    }, 5000);

  } catch (err) {
    console.error('Error setting firmware flag:', err);
  }
  }

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
            {deleteShow && <button 
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              ✖
            </button>}
          </div>
        ) : (
          <span>Drag and drop or browse .bin file</span>
        )}
      </div>

      {!uploaded && <button className="submit-button" onClick={handleSubmit}>
        Submit
      </button>}

      {uploaded && <button className="update-button" onClick={handleUpdate}>
        Start Update
      </button>}

      <p className="status">Status: {status}</p>
    </div>
  );
}
export default Update;



