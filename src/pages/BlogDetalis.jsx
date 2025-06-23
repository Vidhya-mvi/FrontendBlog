import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));


  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        console.log(" Blog data:", res.data);
        setBlog(res.data);
        setLoading(false);
      } catch (err) {
        console.error(" Failed to fetch blog:", err);
        toast.error("Failed to load blog!");
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };



  const handleLike = async (id) => {
    if (!user) return toast.warn("Please log in to like blogs!");

    try {
      const res = await axios.put(
        `http://localhost:5000/api/blogs/like/${id}`,
        {},
        { withCredentials: true }
      );

      console.log("Like API Response:", res.data);

      if (res.data && res.data.likes) {
        setBlog((prev) => ({
          ...prev,
          likes: res.data.likes,
        }));
        toast.success(res.data.message || "Liked the blog!");
      } else {
        console.error("Unexpected response from server:", res.data);
      }
    } catch (err) {
      console.error("Failed to like/unlike blog:", err.response?.data || err.message);
      toast.error("Failed to like/unlike blog!");
    }
  };

  const handleAddComment = async () => {
    if (!user) return toast.warn("Please log in to comment!");
    if (!commentText.trim()) return toast.warn("Comment cannot be empty!");

    try {
      const res = await axios.post(
        `http://localhost:5000/api/blogs/comment/${id}`,
        { text: commentText },
        { withCredentials: true }
      );

      setBlog(res.data);
      setCommentText("");
      toast.success("Comment added!");
    } catch (err) {
      console.error("Failed to add comment:", err.response?.data || err.message);
      toast.error("Failed to add comment!");
    }
  };


  const handleDeleteComment = async (commentId) => {
    if (!user) return toast.warn("Please log in to delete comments!");

    try {
      await axios.delete(
        `http://localhost:5000/api/blogs/comment/${id}/${commentId}`,
        { withCredentials: true }
      );

      setBlog((prev) => ({
        ...prev,
        comments: prev.comments.filter((comment) => comment._id !== commentId),
      }));
      toast.success("Comment deleted!");
    } catch (err) {
      console.error("Failed to delete comment:", err.response?.data || err.message);
      toast.error("Failed to delete comment!");
    }
  };


  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <div className="spinner"></div>
        <h3 style={{ color: "#333" }}>Loading blog...</h3>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f4f4",
        paddingBottom: "30px",
      }}
    >
      <ToastContainer position="top-right" autoClose={2000} />


      <div
        style={{
          background: "#fff",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
          padding: "20px",
          width: "90%",
          maxWidth: "600px",
          textAlign: "center",
          animation: "fadeIn 0.5s ease-in-out",
        }}
      >
        <h1 style={{ marginBottom: "10px", color: "#333" }}>{blog.title}</h1>

        {blog.image && (
          <img
            src={blog.image}
            alt="Blog"
            style={{
              width: "100%",
              maxHeight: "500px",
              objectFit: "contain",
              borderRadius: "10px",
              marginBottom: "15px",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/fallback.jpg";
            }}
          />
        )}



        <p style={{ fontSize: "0.8rem", color: "#3498db", fontWeight: "bold" }}>
          Genre: {blog.genre || "Unknown"}
        </p>

        <p style={{ color: "#777", fontSize: "0.9rem", marginTop: "15px" }}>
          Published on: {formatDate(blog.createdAt)}
        </p>


        <p style={{ color: "#555", lineHeight: "1.6" }}>{blog.content}</p>
        <p style={{ fontWeight: "bold", color: "#777" }}>
          <strong>By:</strong> {blog.postedBy?.username}
        </p>

        <button
          onClick={() => handleLike(blog._id)}
          disabled={!user}
          style={{
            marginTop: "10px",
            padding: "8px 12px",
            backgroundColor: user
              ? blog.likes.includes(user?._id)
                ? "#e74c3c"
                : "#3498db"
              : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: user ? "pointer" : "not-allowed",
            fontWeight: "bold",
            opacity: user ? "1" : "0.6",
          }}
        >
          {user ? (blog.likes.includes(user?._id) ? "Liked" : "Like") : " Like"} ({blog.likes.length})
        </button>




        {user ? (
          <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{
                flex: "1",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ddd",
              }}
            />
            <button
              onClick={handleAddComment}
              style={{
                padding: "8px 10px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: "#3498db",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Comment
            </button>
          </div>
        ) : (
          <p style={{ color: "gray", fontSize: "0.9rem" }}>Log in to comment</p>
        )}


        <h4 style={{ marginTop: "20px", color: "#444" }}>Comments</h4>

        <ul style={{ listStyle: "none", padding: 0, marginTop: "10px", textAlign: "left" }}>
          {blog.comments.length > 0 ? (
            blog.comments.map((comment) => (
              <li key={comment._id} style={{ marginBottom: "8px", padding: "8px", borderBottom: "1px solid #ddd", color: "#444" }}>
                <strong>{comment.postedBy?.username}:</strong> {comment.text}
                {user && (comment.postedBy?._id === user._id || user.role === "admin") && (
                  <button onClick={() => handleDeleteComment(comment._id)} style={{ marginLeft: "10px", backgroundColor: "#e74c3c", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "0.8rem" }}>
                    Delete
                  </button>
                )}
              </li>
            ))
          ) : (
            <p style={{ color: "#777" }}>No comments yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default BlogDetails;
