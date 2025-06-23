import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const GenreBlogs = () => {
  const { genre } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlogsByGenre = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/blogs/genre/${genre}`);

        console.log("API response:", data);
        setBlogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError(err.response?.data?.message || "Failed to fetch blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogsByGenre();
  }, [genre]);

  if (loading)
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <h2>Loading blogs...</h2>
      </div>
    );

  if (error) return <h2 style={styles.error}>{error}</h2>;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Blogs about {genre}</h1>
      <p style={styles.subtitle}>Explore the latest blogs on {genre}!</p>

      {blogs.length > 0 ? (
        blogs.map((blog) => (
          <div key={blog._id} style={styles.blogCard}>
            <h2 style={styles.blogTitle}>{blog.title}</h2>
            <p style={styles.author}>
              By <strong>{blog.postedBy.username}</strong>
            </p>
            <p style={styles.content}>{blog.content.slice(0, 200)}...</p>
            <Link to={`/blogs/${blog._id}`} style={styles.link}>
              Read more →
            </Link>
          </div>
        ))
      ) : (
        <h3 style={styles.noBlogs}>
          No blogs found for this genre. Be the first to write one!
        </h3>
      )}
    </div>
  );
};


const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "'Arial', sans-serif",
  },
  heading: {
    textTransform: "capitalize",
    fontSize: "2.5rem",
    marginBottom: "5px",
    color: "#333",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#666",
    marginBottom: "20px",
  },
  blogCard: {
    padding: "15px",
    marginBottom: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  },
  blogCardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
  },
  blogTitle: {
    fontSize: "1.5rem",
    color: "#4CAF50",
    marginBottom: "5px",
  },
  author: {
    color: "#555",
    fontSize: "0.9rem",
    marginBottom: "10px",
  },
  content: {
    color: "#444",
    lineHeight: "1.6",
    marginBottom: "10px",
  },
  link: {
    color: "#4CAF50",
    fontWeight: "bold",
    textDecoration: "none",
    cursor: "pointer",
  },
  noBlogs: {
    color: "#555",
    fontSize: "1.2rem",
    textAlign: "center",
    marginTop: "20px",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: "20px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  spinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #4CAF50",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
  },
};


const spinnerKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;


const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerHTML = spinnerKeyframes;
document.head.appendChild(styleSheet);

export default GenreBlogs;
