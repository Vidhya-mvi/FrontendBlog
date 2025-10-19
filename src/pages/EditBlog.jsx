import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

axios.defaults.withCredentials = true;

const CustomAlert = ({ message, type, onDismiss }) => {
  if (!message) return null;

  const bgColor = type === "success" ? "#2ecc71" : "#e74c3c"; 

  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: bgColor,
        color: "#fff",
        fontWeight: "bold",
        padding: "12px 24px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        transition: "all 0.3s ease-in-out",
        minWidth: "250px",
        justifyContent: "space-between",
      }}
      role="alert"
    >
      <span>{message}</span>
      <button 
        onClick={onDismiss} 
        style={{
          marginLeft: "15px",
          color: "#fff",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          lineHeight: "1",
        }}
      >
        &times;
      </button>
    </div>
  );
};

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [genre, setGenre] = useState("");
  const [image, setImage] = useState(null); 
  const [preview, setPreview] = useState(null); 
  const [error, setError] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [loading, setLoading] = useState(false);
  
  const genres = ["Technology", "Health", "Lifestyle", "Finance", "Education", "Anime", "Books", "Art", "Manhwa", "Nature", "myths"];
  const MAX_CONTENT_LENGTH = 1000;
  
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/blogs/${id}`, {
          withCredentials: true,
        });

        setTitle(res.data.title);
        setContent(res.data.content);
        setGenre(res.data.genre || "");

        if (res.data.image) {
          setPreview(`${import.meta.env.VITE_API_URL}${res.data.image}`);
        }
      } catch (err) {
        console.error("Failed to fetch blog:", err.response || err.message);
        setError(err.response?.data?.message || "Failed to load blog. Please try again.");
      }
    };

    fetchBlog();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        setImage(null);
        setPreview(null);
        return;
      }
      if (file.size > 2 * 1024 * 1024) { 
        setError("File size must be under 2MB.");
        setImage(null);
        setPreview(null);
        return;
      }
      setError("");
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleContentChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CONTENT_LENGTH) {
      setContent(text);
    }
  };

  const dismissAlert = () => setAlertMessage("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setAlertMessage("");

    if (!genre) {
      setError("Please select a genre.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("genre", genre);
    if (image instanceof File) {
        formData.append("image", image);
    }

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/blogs/${id}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAlertMessage("Blog updated successfully!");
      setAlertType("success");
      
      setTimeout(() => navigate(`/blogs/${id}`), 1000); 

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update blog. Please try again.";
      setAlertMessage(errorMessage);
      setAlertType("error");
      setTimeout(dismissAlert, 5000);
      console.error("Failed to update blog:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .loading-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        /* Mobile first layout: stack elements */
        @media (min-width: 1024px) {
            .responsive-wrapper {
                flex-direction: row;
            }
            .form-section {
                flex: 1;
            }
            .preview-section {
                flex: 1;
                position: sticky;
                top: 32px;
                max-height: calc(100vh - 64px); /* Adjust based on header height */
                overflow-y: auto;
            }
        }
      `}</style>

      <CustomAlert message={alertMessage} type={alertType} onDismiss={dismissAlert} />

      {error && (
        <p style={styles.errorAlert}>
          {error}
        </p>
      )}

      <div style={styles.responsiveWrapper} className="responsive-wrapper">
        <form onSubmit={handleUpdate} style={styles.formSection} className="form-section">
          <h1 style={styles.heading}>
            Edit Your Story
          </h1>

          <input
            type="text"
            placeholder="Compelling Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={styles.input}
          />

          <textarea
            placeholder="Write your amazing blog content here..."
            value={content}
            onChange={handleContentChange}
            rows="10"
            required
            style={styles.textarea}
          />
          <p style={styles.charCount}>
            {content.length}/{MAX_CONTENT_LENGTH} characters
          </p>

          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
            style={{ ...styles.input, ...styles.select }}
          >
            <option value="" disabled>Select a Genre</option>
            {genres.map((g, index) => (
              <option key={index} value={g}>{g}</option>
            ))}
          </select>

          <label style={styles.fileLabel}>
            Feature Image (Optional, max 2MB)
            <input
              type="file"
              onChange={handleImageChange}
              style={styles.fileInput}
            />
          </label>

          <button
            type="submit"
            style={{ ...styles.button, opacity: (!title || !content || !genre || loading) ? 0.5 : 1 }}
            disabled={!title || !content || !genre || loading}
          >
            {loading ? (
              <span style={styles.loadingText}>
                <svg className="loading-icon" style={styles.loadingIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Updating...
              </span>
            ) : (
              "Update Blog"
            )}
          </button>
        </form>

        <div style={styles.previewSection} className="preview-section">
          <h2 style={styles.previewTitle}>
            Live Preview
          </h2>
          <div style={styles.blogCard}>
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                style={styles.blogImage}
              />
            ) : (
              <div style={styles.placeholderImage}>
                No Image Selected
              </div>
            )}
            <div style={styles.blogContent}>
              <span style={styles.blogGenre}>
                {genre || "Select Genre"}
              </span>
              <h3 style={styles.blogTitle}>
                {title || "Blog Title Placeholder"}
              </h3>
              <p style={styles.blogText}>
                {content ? content.slice(0, 150) + (content.length > 150 ? '...' : '') : "Start typing your content to see the preview here. The first few lines will appear..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "16px",
    maxWidth: "1200px",
    margin: "32px auto",
    backgroundColor: "#f4f4f4",
    borderRadius: "16px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
    fontFamily: "Inter, sans-serif",
  },
  responsiveWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    justifyContent: "space-between",
  },
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "24px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e0e0e0",
  },
  heading: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "#1f2937",
    marginBottom: "16px",
    textAlign: "center",
  },
  errorAlert: {
    color: "#b91c1c",
    fontWeight: 500,
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#fee2e2",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
  },
  input: {
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "1rem",
    width: "100%",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  textarea: {
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "1rem",
    width: "100%",
    resize: "vertical",
    minHeight: "150px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  charCount: {
    fontSize: "0.875rem",
    color: "#6b7280",
    textAlign: "right",
    marginTop: "-8px",
  },
  select: {
    backgroundColor: "#fff",
    appearance: "none",
  },
  fileLabel: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
  },
  fileInput: {
    marginTop: "4px",
    display: "block",
    width: "100%",
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  button: {
    backgroundColor: "#10b981", 
    color: "#fff",
    fontWeight: 700,
    padding: "12px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s, box-shadow 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)",
  },
  loadingText: {
    display: "flex",
    alignItems: "center",
  },
  loadingIcon: {
    width: "20px",
    height: "20px",
    marginRight: "8px",
    color: "#fff",
  },
  previewSection: {
    padding: "24px",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    border: "1px solid #f3f4f6",
  },
  previewTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "16px",
    textAlign: "center",
  },
  blogCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
    overflow: "hidden",
    border: "1px solid #d1d5db",
  },
  placeholderImage: {
    width: "100%",
    height: "192px", /* 48 * 4 */
    backgroundColor: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    fontSize: "1rem",
    fontWeight: 500,
  },
  blogImage: {
    width: "100%",
    height: "192px",
    objectFit: "cover",
  },
  blogContent: {
    padding: "20px",
  },
  blogGenre: {
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#2563eb",
  },
  blogTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#1f2937",
    marginTop: "4px",
    marginBottom: "8px",
  },
  blogText: {
    color: "#4b5563",
    fontSize: "0.875rem",
    
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 3,
  },
};

export default EditBlog;
