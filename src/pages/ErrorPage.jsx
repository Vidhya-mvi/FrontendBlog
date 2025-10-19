import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>404</h1>
      <h2 style={styles.subheading}>Page Not Found</h2>
      <p style={styles.message}>
        Oops! The page you're looking for doesn't exist.
      </p>

      <button onClick={() => navigate("/")} style={styles.button}>
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
    backgroundColor: "#f0f0f0",
    color: "#333",
    textAlign: "center",
    fontFamily: "'Arial', sans-serif",
  },
  heading: {
    fontSize: "8rem",
    color: "#e74c3c",
    marginBottom: "10px",
  },
  subheading: {
    fontSize: "2rem",
    marginBottom: "20px",
  },
  message: {
    fontSize: "1.2rem",
    marginBottom: "30px",
    color: "#555",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    color: "#fff",
    backgroundColor: "#4caf50",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#45a049",
  },
};

export default ErrorPage;
