import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateBlog = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [genre, setGenre] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const genres = ["Technology", "Health", "Lifestyle", "Finance", "Education", "Anime", "Books", "Art", "Manhwa","Nature","myths"];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must be under 2MB");
        return;
      }
      setError("");
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const dismissAlert = () => setAlertMessage("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    if (!genre) {
      setError("Please select a genre");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("genre", genre);
    if (image) formData.append("image", image);

    try {
      const res = await axios.post("http://localhost:5000/api/blogs", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAlertMessage("Blog created successfully!");
      setAlertType("success");

      setTimeout(dismissAlert, 3000);

     
      setTitle("");
      setContent("");
      setGenre("");
      setImage(null);
      setPreview(null);

      navigate(`/blogs/${res.data._id}`);
    } catch (err) {
      setAlertMessage(err.response?.data?.message || "Failed to create blog");
      setAlertType("error");

      setTimeout(dismissAlert, 3000);
      console.error("Failed to create blog:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {alertMessage && (
        <div
          style={{
            ...styles.alert,
            backgroundColor: alertType === "success" ? "#4CAF50" : "#FF4C4C",
          }}
        >
          {alertMessage}
          <button onClick={dismissAlert} style={styles.closeButton}>✖</button>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.wrapper}>
     
        <form onSubmit={handleSubmit} style={styles.form}>
          <h1 style={styles.heading}>Create a New Blog</h1>

          <input type="text" placeholder="Blog Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={styles.input} />

          <textarea placeholder="Blog Content" value={content} onChange={(e) => setContent(e.target.value)} rows="10" required style={styles.textarea} />
          <p style={{ color: "#555", fontSize: "0.8rem" }}>{content.length}/1000 characters</p>

          <select value={genre} onChange={(e) => setGenre(e.target.value)} required style={styles.select}>
            <option value="" disabled>Select a Genre</option>
            {genres.map((g, index) => (
              <option key={index} value={g}>{g}</option>
            ))}
          </select>

          <input type="file" onChange={handleImageChange} style={styles.fileInput} />

          <button type="submit" style={styles.button} disabled={!title || !content || !genre || loading}>
            {loading ? "Creating..." : "Create Blog"}
          </button>
        </form>

      
        <div style={styles.previewContainer}>
          <h2 style={styles.previewTitle}>Live Preview</h2>
          <div style={styles.blogCard}>
            {preview && <img src={preview} alt="Preview" style={styles.blogImage} />}
            <div style={styles.blogContent}>
              <h3 style={styles.blogTitle}>{title || "Blog Title"}</h3>
              <p style={styles.blogText}>{content ? content.slice(0, 100) + "..." : "Blog content preview..."}</p>
              <span style={styles.blogGenre}>{genre || "Genre"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const styles = {
  container: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
    backgroundColor: "#f4f4f4",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  wrapper: {
    display: "flex",
    gap: "20px",
    justifyContent: "space-between",
  },
  form: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  heading: {
    color: "#333",
    marginBottom: "10px",
  },
  error: {
    color: "red",
    marginBottom: "10px",
  },
  alert: {
    position: "fixed",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 20px",
    borderRadius: "5px",
    color: "#fff",
    fontWeight: "bold",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    zIndex: 1000,
  },
  closeButton: {
    marginLeft: "10px",
    cursor: "pointer",
    border: "none",
    background: "transparent",
    color: "#fff",
    fontSize: "16px",
  },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #ddd" },
  textarea: { padding: "10px", borderRadius: "5px", border: "1px solid #ddd", resize: "none" },
  select: { padding: "10px", borderRadius: "5px", border: "1px solid #ddd" },
  fileInput: { border: "none" },
  button: { backgroundColor: "#4CAF50", color: "#fff", padding: "10px", borderRadius: "5px", border: "none", cursor: "pointer" },
  previewContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  previewTitle: { textAlign: "center", color: "#333" },
  blogCard: { display: "flex", flexDirection: "column", alignItems: "center", padding: "10px" },
  blogImage: { width: "100%", maxHeight: "500px", objectFit: "cover", borderRadius: "5px" },
  blogTitle: { color: "#333" },
  blogText: { color: "#666", fontSize: "14px",whiteSpace: "pre-line" },
  blogGenre: { fontWeight: "bold", fontSize: "12px", color: "#888" },
};

export default CreateBlog;
