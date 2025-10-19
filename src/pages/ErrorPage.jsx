import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
 const navigate = useNavigate();
const [hover, setHover] = useState(false);

 return (
 <div style={styles.container}>
   <h1 style={styles.heading}>404</h1>
<h2 style={styles.subheading}>Page Not Found</h2>
 <p style={styles.message}>
 Oops! The page you're looking for doesn't exist.
 </p>

<button
 onClick={() => navigate("/")}
 style={{
...styles.button,
 backgroundColor: hover ? "#10b981" : "#10b981", 
           boxShadow: hover ? "0 6px 15px rgba(16, 185, 129, 0.5)" : "0 4px 6px rgba(16, 185, 129, 0.3)"
}}
 onMouseEnter={() => setHover(true)}
 onMouseLeave={() => setHover(false)}
 >
 Go Back Home
 </button>
</div>
);
};

const styles = {
 container: {
  height: "100vh",
 width: "100%",
display: "flex",
 flexDirection: "column",
 justifyContent: "center",
alignItems: "center",
 backgroundColor: "#f9fafb",
color: "#1f2937",
 textAlign: "center",
 fontFamily: "Inter, sans-serif", 
 },
heading: {
 fontSize: "8rem",
 color: "#ef4444",
marginBottom: "10px",
 fontWeight: 900,
 textShadow: "4px 4px 0 rgba(239, 68, 68, 0.1)",
 },
 subheading: {
 fontSize: "2rem",
 marginBottom: "20px",
fontWeight: 700,
 color: "#374151",
 },
 message: {
 fontSize: "1.2rem",
marginBottom: "40px",
 color: "#6b7280",
 },
 button: {
 padding: "12px 24px",
 fontSize: "1rem",
 color: "#fff",
backgroundColor: "#10b981", 
 border: "none",
 borderRadius: "8px",
 cursor: "pointer",
 transition: "all 0.3s ease",
 fontWeight: 600,
 boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)",
 },
};

export default ErrorPage;
