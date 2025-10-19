import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

axios.defaults.withCredentials = true;


const useAuthStatus = () => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
        setUser(res.data.user);
      } catch (error) {
          console.error("Failed to verify authentication:", error);
        setUser(null);
      } finally {
        setIsAuthReady(true);
      }
    };
    checkAuth();
  }, []);
  
  return { user, isAuthReady };
};

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  
  const { user, isAuthReady } = useAuthStatus();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/blogs/${id}`);
        setBlog(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch blog:", err);
        toast.error("Failed to load blog!");
      } finally {
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

  const isLiked = user && blog?.likes?.includes(user?._id);

  const handleLike = useCallback(async (blogId) => {
    if (!user) return toast.warn("Please log in to like blogs!");

    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/blogs/like/${blogId}`);
      
      if (res.data && res.data.likes) {
        setBlog((prev) => ({ ...prev, likes: res.data.likes }));
        toast.success(res.data.message || "Like updated!");
      } else {
        toast.error("Unexpected response from server!");
      }
    } catch (err) {
      console.error("Failed to like/unlike blog:", err.response?.data || err.message);
      toast.error("Failed to like/unlike blog!");
    }
  }, [user]);

  const handleAddComment = useCallback(async () => {
    if (!user) return toast.warn("Please log in to comment!");
    if (!commentText.trim()) return toast.warn("Comment cannot be empty!");

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/blogs/comment/${id}`, {
        text: commentText,
      });

      setBlog(res.data);
      setCommentText("");
      toast.success("Comment added!");
    } catch (err) {
      console.error("Failed to add comment:", err.response?.data || err.message);
      toast.error("Failed to add comment!");
    }
  }, [id, commentText, user]);

  const handleDeleteComment = useCallback(async (commentId) => {
    if (!user) return toast.warn("Please log in to delete comments!");

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/blogs/comment/${id}/${commentId}`);

      setBlog((prev) => ({
        ...prev,
        comments: prev.comments.filter((comment) => comment._id !== commentId),
      }));
      toast.success("Comment deleted!");
    } catch (err) {
      console.error("Failed to delete comment:", err.response?.data || err.message);
      toast.error("Failed to delete comment!");
    }
  }, [id, user]);
  
  if (loading || !isAuthReady)
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <style>{`
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="spinner"></div>
        <h3 style={{ color: "#333" }}>{loading ? "Loading blog..." : "Checking user status..."}</h3>
      </div>
    );

  if (!blog)
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <h3 style={{ color: "red" }}>Blog not found.</h3>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f4f4",
        padding: "30px 20px",
        boxSizing: "border-box",
      }}
    >
      <ToastContainer position="top-right" autoClose={2000} />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .blog-card {
          animation: fadeIn 0.5s ease-in-out;
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="blog-card"
        style={{
          background: "#fff",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
          padding: "20px",
          width: "100%",
          maxWidth: "750px", 
          textAlign: "left", 
        }}
      >
        <h1 style={{ marginBottom: "10px", color: "#333", fontSize: "2rem", textAlign: "center" }}>
          {blog.title}
        </h1>
        
        <p style={{ 
          fontSize: "0.9rem", 
          color: "#3498db", 
          fontWeight: "bold", 
          marginBottom: "15px",
          textAlign: "center"
        }}>
          Genre: {blog.genre || "Unknown"} | By: {blog.postedBy?.username || "Anonymous"} | Published: {formatDate(blog.createdAt)}
        </p>

        {blog.image && (
          <img
            src={
              blog.image.startsWith("http")
                ? blog.image
                : `${import.meta.env.VITE_API_URL}/${blog.image}`
            }
            alt="Blog"
            style={{
              width: "100%",
              maxHeight: "500px",
              objectFit: "cover", 
              borderRadius: "10px",
              marginBottom: "20px",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/750x300/e0e0e0/555?text=Image+Unavailable";
            }}
          />
        )}

        <div style={{ color: "#555", lineHeight: "1.8", whiteSpace: "pre-wrap", borderBottom: "1px solid #eee", paddingBottom: "20px", marginBottom: "20px" }}>
          {blog.content}
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "10px 0" }}>
          <button
            onClick={() => handleLike(blog._id)}
            disabled={!user} 
            style={{
              padding: "10px 15px",
              backgroundColor: isLiked ? "#e74c3c" : "#3498db",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: user ? "pointer" : "not-allowed",
              fontWeight: "bold",
              opacity: user ? "1" : "0.6",
              transition: "background-color 0.2s",
            }}
          >
            {isLiked ? "Liked" : "Like"} 
          </button>
          <span style={{ color: "#777", fontSize: "0.9rem" }}>
            {blog.likes?.length} {blog.likes?.length === 1 ? 'person' : 'people'} liked this.
          </span>
        </div>

        <h3 style={{ marginTop: "20px", color: "#333", borderBottom: "2px solid #333", paddingBottom: "5px" }}>
          Comments ({blog.comments?.length || 0})
        </h3>

        {user ? (
          <div style={{ marginTop: "15px", display: "flex", gap: "10px", marginBottom: "20px" }}>
            <textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows="2"
              style={{
                flex: "1",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ddd",
                resize: "vertical",
                minHeight: "40px",
              }}
            />
            <button
              onClick={handleAddComment}
              style={{
                padding: "8px 15px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: "#2ecc71",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background-color 0.2s",
                alignSelf: "flex-start",
              }}
            >
              Post
            </button>
          </div>
        ) : (
          <p style={{ color: "gray", fontSize: "0.9rem", padding: "10px 0" }}>
            Please log in to comment.
          </p>
        )}

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            marginTop: "10px",
          }}
        >
          {blog.comments?.length > 0 ? (
            blog.comments.map((comment) => (
              <li
                key={comment._id}
                style={{
                  marginBottom: "15px",
                  padding: "10px 15px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ margin: "0", fontSize: "0.95rem", fontWeight: "bold", color: "#3498db" }}>
                    {comment.postedBy?.username || "User"}
                  </p>
                  {(user && 
                     (comment.postedBy?._id === user._id || user.role === "admin")) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        style={{
                          backgroundColor: "#e74c3c",
                          color: "#fff",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          transition: "background-color 0.2s",
                        }}
                      >
                        Delete
                      </button>
                  )}
                </div>
                <p style={{ margin: "5px 0 0 0", color: "#444", whiteSpace: "pre-wrap" }}>
                  {comment.text}
                </p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#999", textAlign: "right" }}>
                  {formatDate(comment.createdAt)}
                </p>
              </li>
            ))
          ) : (
            <p style={{ color: "#777", padding: "10px 0" }}>Be the first to comment!</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default BlogDetails;
