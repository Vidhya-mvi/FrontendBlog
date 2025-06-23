import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    const { username, email, password } = formData;
    if (username.length < 3) return "Username must be at least 3 characters!";
    if (!email.includes("@")) return "Please enter a valid email!";
    if (password.length < 6) return "Password must be at least 6 characters!";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const validationError = validateForm();
    if (validationError) return setError(validationError);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );
      setSuccess(" Registration successful! Redirecting to OTP...");
      setTimeout(() => {
        navigate("/otp", { state: { userId: res.data.userId } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
          width: "400px",
          maxWidth: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "20px", color: "#333" }}>Register</h1>

        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
        {success && <p style={{ color: "green", marginBottom: "10px" }}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              fontSize: "16px",
            }}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "5px",
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
              padding: "12px",
              marginBottom: "20px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              fontSize: "16px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: loading ? "#aaa" : "#6a0572",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
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
            onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
            onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={{ marginTop: "10px", color: "#555" }}>
          <Link to="/" style={{ color: "#6a0572", textDecoration: "none" }}>
            Home
          </Link>
        </p>

        <p style={{ color: "#555" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#6a0572", textDecoration: "none" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
