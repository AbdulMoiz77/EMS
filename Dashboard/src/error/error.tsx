import { Link } from "react-router-dom";
import "./errorstyles.css";
import emptyBox from "../assets/emptybox.png"; 

export default function ErrorPage() {
  return (
    <div className="error-wrapper">
      <div className="container">
        <h1>Nothing's Here 🌚</h1>
        <div className="img-container">
          <img src={emptyBox} alt="Empty box" />
        </div>        
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <Link 
            to="/" 
            style={{ 
                textDecoration: 'none', 
                color: '#fff', 
                backgroundColor: '#194759', 
                padding: '10px 20px', 
                borderRadius: '8px',
                fontWeight: '500'
            }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}