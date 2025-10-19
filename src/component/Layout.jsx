import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./Searchbar";

const Layout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [showGenres, setShowGenres] = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const genres = [
    "Technology",
    "Health",
    "Lifestyle",
    "Finance",
    "Education",
    "Anime",
    "Books",
    "Art",
    "Manhwa",
    "Nature",
    "myths"
  ];

  const handleGenreClick = (genre) => {
    const formattedGenre = encodeURIComponent(genre.toLowerCase());
    navigate(`/genre/${formattedGenre}`);
    setShowGenres(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGenres(false);
      }
    };
    if (showGenres) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showGenres]);

  return (
    <div style={{ width: "100vw", height: "100vh", margin: "0", padding: "0" }}>
      <nav
        style={{
          width: "100%",
          backgroundColor: "#333",
          color: "#fff",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 10,
          height: "60px",
          boxSizing: "border-box",
        }}
      >
       
        <div
          style={{ cursor: "pointer", fontSize: "1.8rem", padding: "0 10px" }}
          onClick={() => setShowGenres(!showGenres)}
        >
          ☰
        </div>

        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "60px",
            left: "0",
            backgroundColor: "#444",
            boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
            zIndex: "20",
            width: "200px",
            padding: "10px 0",
            borderRadius: "0 0 5px 5px",
            transform: showGenres ? "translateY(0)" : "translateY(-10px)",
            opacity: showGenres ? 1 : 0,
            visibility: showGenres ? "visible" : "hidden",
            transition: "all 0.3s ease-in-out",
          }}
        >
          {genres.map((genre) => (
            <div
              key={genre}
              onClick={() => handleGenreClick(genre)}
              style={{
                padding: "10px",
                color: "#fff",
                cursor: "pointer",
                textAlign: "center",
                borderBottom: "1px solid #555",
              }}
            >
              {genre}
            </div>
          ))}
        </div>

      
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            flexGrow: 1,
            textAlign: "center",
          }}
        >
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
            Blogify
          </Link>
        </div>

        {/* Search Bar */}
        <div style={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
          <SearchBar />
        </div>

      
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {user ? (
            <>
              <Link to="/myblogs" style={{ color: "#fff", textDecoration: "none" }}>
                My Blogs
              </Link>
              <Link to="/create" style={{ color: "#fff", textDecoration: "none" }}>
                Create Blog
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  style={{ color: "#FFD700", textDecoration: "none", fontWeight: "bold" }}
                >
                  Admin Dashboard
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/register" style={{ color: "#fff", textDecoration: "none" }}>
                Register
              </Link>
              <Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>
                Login
              </Link>
            </>
          )}

      
          {user && (
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#e74c3c",
                color: "#fff",
                border: "none",
                padding: "8px 15px",
                cursor: "pointer",
                borderRadius: "5px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      <div
        style={{
          padding: "20px",
          paddingTop: "80px",
          width: "100vw",
          minHeight: "100vh",
          backgroundColor: "#f4f4f4",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Layout;
