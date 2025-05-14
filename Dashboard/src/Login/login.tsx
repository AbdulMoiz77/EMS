import React, { FormEvent, useState, useRef } from 'react';
import './login.css';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    
    const idRef = useRef();
    const passRef = useRef();
    const [shake, setShake] = useState(false);
    const [icons, seticons]= useState(true);
    const [showError, setShowError] = useState(false);
    const navigate = useNavigate();

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        const id = idRef.current.value;
        const pass = passRef.current.value;

        if(id == import.meta.env.VITE_APP_ADMIN_USER && pass == import.meta.env.VITE_APP_ADMIN_PASS ){
            navigate("/update", {state: {flag: true}});
        }else{
            setShake(true);
            setShowError(true);
            seticons(false);
    
            setTimeout(() => {
                setShowError(false)
                setShake(false);
                seticons(true)
                idRef.current.value = ''
                passRef.current.value = ''
            }, 3000);
        }

    };



    return (
        <div className="login-page">
            <div className="wrapper">
                <form onSubmit={submit}>
                    <h1>Login</h1>
                    <div className={`input-box ${shake ? 'shake' : ''}`}>
                        <input id="Username" type="text" ref={idRef} placeholder="userID" autoComplete="off" required />
                        {icons && <i className="user-icon bx bx-user"></i>}
                        {showError && <i className="error error-icon fas fa-exclamation-circle"></i>}
                    </div>

                    <div className={`input-box ${shake ? 'shake' : ''}`}>
                        <input id="password" type="password" ref={passRef} placeholder="Password" required />
                        {icons && <i className="password-icon bx bx-lock-alt"></i>}
                        {showError && <i className="error error-icon fas fa-exclamation-circle"></i>}
                    </div>
                    {showError && <div className="error error-txt">***Invalid Credentials***</div>}
                    <button type="submit" className="btn">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
