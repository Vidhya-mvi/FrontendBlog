import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faCommentDots } from "@fortawesome/free-solid-svg-icons"; 
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

axios.defaults.withCredentials = true;

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [expandedBlogs, setExpandedBlogs] = useState({});
  const [showComments, setShowComments] = useState({});
  const [user, setUser] = useState(null); 
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/blogs`);
        setBlogs(res.data);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
        toast.error("Failed to load blog feed.");
      } finally {
        setIsLoadingBlogs(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleLike = async (id, isLiked) => {
    if (!user) {
      toast.warn("Please log in to like blogs!");
      return;
    }

    try {
      const endpoint = `${import.meta.env.VITE_API_URL}/api/blogs/like/${id}`;
      const res = await axios.put(endpoint, {});

      setBlogs((prev) =>
        prev.map((b) => 
          b._id === id ? { ...b, likes: res.data.likes } : b
        )
      );
      toast.success(isLiked ? "Blog unliked!" : "Blog liked!");

    } catch (err) {
      console.error("Failed to like/unlike blog:", err);
      toast.error("Failed to update like status.");
    }
  };

  const handleInputChange = (id, value) => {
    setCommentText((prev) => ({ ...prev, [id]: value }));
  };

  const handleComment = async (id) => {
    const comment = commentText[id];
    if (!user) {
      toast.warn("Please log in to comment!");
      return;
    }
    if (!comment?.trim()) return toast.warn("Comment cannot be empty.");

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/blogs/comment/${id}`, { text: comment });
      
      setBlogs((prev) =>
        prev.map((blog) => (blog._id === id ? { ...blog, comments: res.data.comments } : blog))
      );
      setCommentText((prev) => ({ ...prev, [id]: "" }));
      toast.success("Comment added!");

    } catch (err) {
      console.error("Failed to add comment:", err);
      toast.error("Failed to add comment. Please try again.");
    }
  };

  const toggleExpand = (id) => setExpandedBlogs((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleComments = (id) => setShowComments((prev) => ({ ...prev, [id]: !prev[id] }));

  if (isLoadingBlogs) return <h3 style={{ padding: "20px", color: "#333" }}>Loading latest blogs...</h3>;

  if (!blogs.length && !isLoadingBlogs) return <h3 style={{ padding: "20px", color: "#333" }}>No blogs found. Check back later!</h3>;


  return (
    <div 
      style={{ 
        padding: "20px", 
        fontFamily: "Inter, Arial, sans-serif",
        backgroundColor: "#f4f7f6" 
      }}
    >
      <h1 style={{ color: "#2c3e50", marginBottom: "30px", fontSize: "2rem" }}>Latest Blogs</h1>
      <ToastContainer position="bottom-center" autoClose={3000} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: "25px",
          paddingBottom: "20px",
        }}
      >
        {blogs.map((blog) => {
          const isLiked = user && blog.likes.includes(user._id);
          const isExpanded = expandedBlogs[blog._id];
          const shouldShowComments = showComments[blog._id];

          return (
            <div
              key={blog._id}
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                overflow: "hidden", 
                display: "flex",
                flexDirection: "column",
                border: "1px solid #eee",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/blogs/${blog._id}`)}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              {blog.image && (
                <img
                  src={blog.image.startsWith("http") ? blog.image : `https://placehold.co/400x220/3498db/ffffff?text=Blog+Image`}
                  alt={blog.title}
                  style={{ 
                    width: "100%", 
                    height: "220px", 
                    objectFit: "cover", 
                    backgroundColor: "#f0f0f0" 
                  }}
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = `https://placehold.co/400x220/3498db/ffffff?text=No+Image`;
                  }}
                />
              )}

              <div style={{ padding: "15px", flexGrow: 1 }}>
                <h2 style={{ fontSize: "1.2rem", color: "#2c3e50", marginBottom: "10px" }}>{blog.title}</h2>

                <p style={{ color: "#555", fontSize: "0.9rem", lineHeight: "1.5" }}>
                  {isExpanded || blog.content.length <= 150
                    ? blog.content
                    : `${blog.content.substring(0, 150)}... `}
                  {blog.content.length > 150 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        toggleExpand(blog._id);
                      }}
                      style={{ 
                        background: "none", 
                        color: "#3498db", 
                        border: "none", 
                        cursor: "pointer", 
                        fontWeight: "bold", 
                        fontSize: "0.9rem", 
                        marginLeft: "5px" 
                      }}
                    >
                      {isExpanded ? "Show Less" : "Show More"}
                    </button>
                  )}
                </p>

                <p style={{ fontSize: "0.8rem", color: "#777", marginTop: "10px" }}>
                  By: <strong>{blog.postedBy?.username || "Guest"}</strong> | Genre: {blog.genre || "N/A"}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "15px", borderTop: "1px solid #eee", paddingTop: "10px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(blog._id, isLiked);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: isLiked ? "#e74c3c" : "#3498db",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "0.8rem",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <FontAwesomeIcon icon={faHeart} style={{ marginRight: "5px" }} />
                    {blog.likes.length} {isLiked ? "Unlike" : "Like"}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComments(blog._id);
                    }}
                    style={{
                      background: "none", 
                      color: "#2c3e50", 
                      border: "1px solid #ccc", 
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <FontAwesomeIcon icon={faCommentDots} style={{ marginRight: "5px" }} />
                    {blog.comments.length} Comments
                  </button>

                </div>

                {shouldShowComments && (
                  <div style={{ marginTop: "20px", backgroundColor: "#f9f9f9", padding: "10px", borderRadius: "8px" }}>
                    
                    {user && (
                      <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
                        <input
                          type="text"
                          placeholder="Write a public comment..."
                          value={commentText[blog._id] || ""}
                          onChange={(e) => handleInputChange(blog._id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ 
                            flexGrow: 1, 
                            padding: "8px", 
                            borderRadius: "5px", 
                            border: "1px solid #ddd", 
                            fontSize: "0.9rem" 
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComment(blog._id);
                          }}
                          style={{ 
                            padding: "8px 12px", 
                            borderRadius: "5px", 
                            border: "none", 
                            backgroundColor: "#2ecc71", 
                            color: "#fff", 
                            fontWeight: "bold", 
                            fontSize: "0.9rem", 
                            cursor: "pointer" 
                          }}
                          title="Post Comment"
                        >
                          Post
                        </button>
                      </div>
                    )}

                    {blog.comments.map((comment, index) => (
                      <div key={index} style={{ borderBottom: "1px dotted #eee", padding: "5px 0" }}>
                        <p style={{ fontSize: "0.8rem", color: "#333" }}>
                          <strong style={{ color: "#3498db" }}>{comment.postedBy?.username || "Unknown"}</strong>: {comment.text}
                        </p>
                      </div>
                    ))}
                    {blog.comments.length === 0 && <p style={{ fontSize: "0.8rem", color: "#777" }}>Be the first to comment!</p>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
