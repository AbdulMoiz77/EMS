import { FormEvent, useState, useRef } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

function Login() {
    
    const idRef = useRef<HTMLInputElement>(null);
    const passRef = useRef<HTMLInputElement>(null);
    const [shake, setShake] = useState(false);
    const [icons, seticons]= useState(true);
    const [showError, setShowError] = useState(false);
    const navigate = useNavigate();

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!idRef.current || !passRef.current) return;
        
        const email = idRef.current.value;
        const pass = passRef.current.value;

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            navigate("/update");
        } catch (error) {
            console.error("Login Error:", error);
            triggerError();
        }
    };
      
    const triggerError = () => {
        setShake(true);
        setShowError(true);
        seticons(false);

        setTimeout(() => {
            setShowError(false);
            setShake(false);
            seticons(true);
            if (idRef.current) idRef.current.value = '';
            if (passRef.current) passRef.current.value = '';
        }, 3000);
    };

    return (
        <div className="login-page">
            <div className="wrapper">
                <form onSubmit={submit}>
                    <h1>Login</h1>
                    <div className={`input-box ${shake ? 'shake' : ''}`}>
                        <input id="Username" type="email" ref={idRef} placeholder="userID" autoComplete="off" required />
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
