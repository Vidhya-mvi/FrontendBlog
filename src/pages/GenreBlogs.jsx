import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true;

const GenreBlogs = () => {
  const { genre } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredBlogId, setHoveredBlogId] = useState(null); 

  useEffect(() => {
    const fetchBlogsByGenre = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/blogs/genre/${genre}`
        );

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
        <style>{spinnerKeyframes}</style>
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
          <div 
            key={blog._id} 
            style={hoveredBlogId === blog._id ? {...styles.blogCard, ...styles.blogCardHover} : styles.blogCard}
            onMouseEnter={() => setHoveredBlogId(blog._id)}
            onMouseLeave={() => setHoveredBlogId(null)}
          >
            {blog.image && (
              <img 
                src={`${import.meta.env.VITE_API_URL}${blog.image}`} 
                alt={blog.title} 
                style={styles.blogImage}
              />
            )}
            <div style={styles.blogContentWrapper}>
                <h2 style={styles.blogTitle}>{blog.title}</h2>
                <p style={styles.author}>
                    By <strong>{blog.postedBy?.username || "Unknown Author"}</strong>
                </p>
                <p style={styles.content}>{blog.content.slice(0, 200)}...</p>
                <Link to={`/blogs/${blog._id}`} style={styles.link}>
                    Read more →
                </Link>
            </div>
          </div>
        ))
      ) : (
        <h3 style={styles.noBlogs}>
          No blogs found for this genre. Be the first to write one!
        </h3>
      )}
      <style>{spinnerKeyframes}</style>
    </div>
  );
};


const styles = {
  container: {
    padding: "32px 16px",
    maxWidth: "900px",
    margin: "32px auto",
    fontFamily: "Inter, sans-serif",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
  },
  heading: {
    textTransform: "capitalize",
    fontSize: "2.5rem",
    marginBottom: "8px",
    color: "#1f2937",
    fontWeight: 800,
  },
  subtitle: {
    fontSize: "1rem",
    color: "#6b7280",
    marginBottom: "32px",
  },
  blogCard: {
    padding: "20px",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    backgroundColor: "#f9fafb",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  blogCardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 10px 20px rgba(16, 185, 129, 0.2)",
    border: "1px solid #10b981",
  },
  blogImage: {
      width: "100%",
      maxHeight: "250px",
      objectFit: "cover",
      borderRadius: "8px",
      marginBottom: "10px",
  },
  blogContentWrapper: {
      flex: 1,
  },
  blogTitle: {
    fontSize: "1.5rem",
    color: "#10b981",
    marginBottom: "5px",
    fontWeight: 700,
  },
  author: {
    color: "#6b7280",
    fontSize: "0.9rem",
    marginBottom: "10px",
  },
  content: {
    color: "#4b5563",
    lineHeight: "1.6",
    marginBottom: "15px",
  },
  link: {
    color: "#10b981", 
    fontWeight: "bold",
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #10b981",
    display: "inline-block",
    transition: "background-color 0.2s",
  },
  noBlogs: {
    color: "#6b7280",
    fontSize: "1.2rem",
    textAlign: "center",
    marginTop: "40px",
    padding: "20px",
    border: "1px dashed #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#f3f4f6",
  },
  error: {
    color: "#ef4444",
    textAlign: "center",
    marginTop: "40px",
    fontSize: "1.5rem",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    fontFamily: "Inter, sans-serif",
  },
  spinner: {
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #10b981", 
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
};


const spinnerKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default GenreBlogs;
