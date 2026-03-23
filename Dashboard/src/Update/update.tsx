import { useEffect, useState, useRef, ChangeEvent, DragEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavLink } from "react-router-dom";
import { Typography } from '@mui/material';
import { database, auth } from '../firebase/config';
import { ref, set, get, onValue, Unsubscribe } from 'firebase/database';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import "./update.css";

function Update(){
  const navigate = useNavigate();    
  const hasAlerted = useRef(false);
  const logOut = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileSelected, setFileSelected] = useState(false);
  const [status, setStatus] = useState("No action taken");
  const [uploaded, setUploaded] = useState(false);
  const [deleteShow, setDeleteShow] = useState(true);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthChecking(false);
      } else {
        if (!logOut.current) {
          if (!hasAlerted.current) {
            alert('Please login first');
            hasAlerted.current = true;
            navigate('/login');
          }
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [navigate]);

  useEffect(() => {
    const handleBackButton = () => {  
      logOut.current = true;    
      signOut(auth).catch((error) => console.error("Error signing out:", error));
    };

    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);

  const handleLogoutAndGoHome = async () => {
    logOut.current = true;
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out: ', error);
      navigate('/');
    }
  };

  const isBinFile = (file: File | null) => {
    return file && file.name.toLowerCase().endsWith('.bin');
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile && isBinFile(selectedFile)) {
      setFile(selectedFile);
      setFileSelected(true);
      setStatus(`${selectedFile.name} selected`);
    } else {
      setStatus('Only .bin files are supported');
      e.target.value = '';
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (isBinFile(droppedFile)) {
      setFile(droppedFile);
      setStatus(`${droppedFile.name} selected`);
    } else {
      setStatus('Only .bin files are supported');
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDelete = () => {
    setFile(null);
    setStatus('File removed');
    setFileSelected(false);
    if (fileRef.current) {
      fileRef.current.value = '';
    }
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
    const firmwareRef = ref(database, 'Firmware');
    const statusRef = ref(database, 'Firmware/status');
    let initialStatus = "";

    try {
      const snapshot = await get(statusRef);
      initialStatus =   snapshot.exists() ? snapshot.val() : "";

      await set(updateRef, true);
      setStatus('Changed the update flag');

      unsubscribeRef.current = onValue(firmwareRef, (snapshot) => {
        if(!snapshot.exists()) return;
        const data = snapshot.val();

        if (data.status && data.status !== initialStatus) {
          setStatus(data.status);
        }

        if (data.update === false) {
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
          }

          setTimeout(() => {
            setDeleteShow(true);
            setUploaded(false);
            setFile(null);
            setFileSelected(false);
            if (fileRef.current) fileRef.current.value = '';

            setStatus(data.status || "Update Finished");

            setTimeout(() => {
              setStatus("No action taken");
            }, 5000);
          }, 5000);
        }
      }, (error) => {
        console.error("Firebase listen error:", error);
        setStatus("Error starting update");
      });
    
    }
      catch (err) {
      console.error('Error setting firmware flag:', err);
      setStatus("Error starting update");
    }
  }

  if (isAuthChecking) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Authenticating...</div>;
  }
  return (
    <div className="file-wrapper">
      
      <button className="home-button" onClick={handleLogoutAndGoHome}>
        <img src="/home.png" alt="Home" className="home-icon" />
      </button>
      

      <Typography variant="h4" gutterBottom   sx={{mr: 2, color: "#ebf2f1", fontFamily: "'Poppins', sans-serif", fontWeight: 'bold', fontSize: '2.5rem', letterSpacing: '2px' }}>
          Update Firmware OTA
      </Typography>
      <div className={`dropzone ${fileSelected ? 'fileSelected': ''}`} onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileRef.current?.click()} >
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