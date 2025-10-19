import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

axios.defaults.withCredentials = true;

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔹 Sending login data:", formData);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        formData
      );

      console.log(" Login successful. Session cookie is now set.");

      const { user } = res.data;

      

      if (user && user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(" Login failed:", err.response?.data || err.message);

      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(to right, #a1c4fd, #c2e9fb)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, Arial, sans-serif",
        overflow: "auto", 
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "30px", 
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
          width: "90%", 
          maxWidth: "400px", 
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "20px", color: "#333" }}>Login</h1>

        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "14px", 
              marginBottom: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "16px",
            }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "14px", 
              marginBottom: "20px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "16px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: loading ? "#aaa" : "#6a0572",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              transition: "transform 0.1s ease",
            }}
            onMouseOver={(e) =>
              !loading && (e.target.style.backgroundColor = "#8a0a92")
            }
            onMouseOut={(e) =>
              !loading && (e.target.style.backgroundColor = "#6a0572")
            }
            onMouseDown={(e) => (e.target.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "20px", color: "#555" }}>
          <Link to="/" style={{ color: "#6a0572", textDecoration: "none" }}>
            Home
          </Link>
        </p>

        <p style={{ color: "#555", fontSize: "14px" }}>
          Don’t have an account?{" "}
          <Link to="/register" style={{ color: "#6a0572", textDecoration: "none", fontWeight: "bold" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
