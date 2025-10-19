import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";

axios.defaults.withCredentials = true;

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", width: "100%", maxWidth: "300px" }}>
      <input
        type="text"
        placeholder="Search blogs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          padding: "8px 12px",
          borderRadius: "5px 0 0 5px",
          border: "1px solid #555",
          borderRight: "none",
          flexGrow: 1,
          fontSize: "14px",
          minWidth: "100px",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "8px 12px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "1px solid #4CAF50",
          borderRadius: "0 5px 5px 0",
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
      >
        <FontAwesomeIcon icon={faSearch} />
      </button>
    </form>
  );
};

const useAuthStatus = () => {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
        console.warn("User not authenticated or session expired.", error);
      } finally {
        setIsReady(true);
      }
    };
    checkAuth();
  }, []);
  
  const isAdmin = user?.role?.toLowerCase() === "admin";
  return { user, isAdmin, isReady };
};

const Layout = ({ children }) => {
  const { user, isAdmin, isReady } = useAuthStatus();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showGenres, setShowGenres] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`);
      window.location.href = "/"; 
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/";
    }
  };

  const genres = [
    "Technology", "Health", "Lifestyle", "Finance", "Education",
    "Anime", "Books", "Art", "Manhwa", "Nature", "myths"
  ];

  const handleGenreClick = (genre) => {
    const formattedGenre = encodeURIComponent(genre.toLowerCase());
    navigate(`/genre/${formattedGenre}`);
    setShowGenres(false);
    setMobileMenuOpen(false); 
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGenres(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: "5px",
    transition: "background-color 0.2s",
    whiteSpace: "nowrap",
    fontWeight: 500
  };

  const mobileLinkStyle = {
    ...linkStyle,
    color: "#333",
    display: "block",
    padding: "12px 20px",
    borderBottom: "1px solid #eee",
    textAlign: "left"
  };

  const breakpoint = 768;
  const isMobile = window.innerWidth < breakpoint;


  const NavLinks = () => (
    <>
      {user ? (
        <div style={isMobile ? { display: "block" } : { display: "flex", alignItems: "center", gap: "10px" }}>
          <Link to="/myblogs" style={isMobile ? mobileLinkStyle : linkStyle}>
            My Blogs
          </Link>
          <Link to="/create" style={isMobile ? mobileLinkStyle : linkStyle}>
            Create Blog
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              style={isMobile ? { ...mobileLinkStyle, color: "#FFD700" } : { ...linkStyle, color: "#FFD700", fontWeight: "bold" }}
            >
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            style={isMobile ? {
                width: "90%",
                margin: "10px 5%",
                backgroundColor: "#e74c3c",
                color: "#fff",
                border: "none",
                padding: "10px 15px",
                cursor: "pointer",
                borderRadius: "5px",
                fontWeight: "bold",
              } : {
                backgroundColor: "#e74c3c",
                color: "#fff",
                border: "none",
                padding: "8px 15px",
                cursor: "pointer",
                borderRadius: "5px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }
            }
          >
            Logout
          </button>
        </div>
      ) : (
        <div style={isMobile ? { display: "block" } : { display: "flex", alignItems: "center", gap: "15px" }}>
          <Link to="/register" style={mobileMenuOpen ? mobileLinkStyle : linkStyle}>
            Register
          </Link>
          <Link to="/login" style={mobileMenuOpen ? mobileLinkStyle : linkStyle}>
            Login
          </Link>
        </div>
      )}
    </>
  );

  if (!isReady) {
    return <div style={{ padding: '20px' }}>Loading application...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Inter, Arial, sans-serif" }}>
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
          zIndex: 100,
          height: "60px",
          boxSizing: "border-box",
        }}
      >
        <div
          ref={dropdownRef}
          style={{ display: "flex", alignItems: "center" }}
        >
          <button
            onClick={() => setShowGenres(!showGenres)}
            style={{ 
              background: "none", 
              border: "none", 
              color: "#fff", 
              fontSize: "1.5rem", 
              cursor: "pointer", 
              padding: "0 10px" 
            }}
          >
            ☰
          </button>
          
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "0",
              backgroundColor: "#444",
              boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
              zIndex: "10",
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
                  padding: "10px 20px",
                  color: "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                  borderBottom: "1px solid #555",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#555")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#444")}
              >
                {genre}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            padding: "0 10px",
            whiteSpace: "nowrap",
          }}
        >
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
            Blogify
          </Link>
        </div>

        <div 
          style={{ 
            flexGrow: 1, 
            display: isMobile ? 'none' : 'flex', 
            justifyContent: "center", 
            padding: "0 20px" 
          }}
        >
          <SearchBar />
        </div>

        {isMobile ? (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ 
              background: "none", 
              border: "none", 
              color: "#fff", 
              fontSize: "1.5rem", 
              cursor: "pointer" 
            }}
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <NavLinks />
          </div>
        )}
      </nav>

      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: "60px",
            right: 0,
            width: mobileMenuOpen ? "70vw" : "0",
            height: "100%",
            backgroundColor: "#fff",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            zIndex: 99,
            overflowX: "hidden",
            transition: "width 0.3s ease-in-out",
            paddingTop: "20px",
          }}
        >
          {mobileMenuOpen && (
            <div onClick={() => setMobileMenuOpen(false)}>
                <div style={{ padding: "0 20px", marginBottom: "20px" }}>
                    <SearchBar />
                </div>
                <NavLinks />
            </div>
          )}
        </div>
      )}

      <div
        style={{
          padding: "20px",
          paddingTop: "80px", 
          width: "100%",
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
