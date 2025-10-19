import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;

const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [showBlogConfirm, setShowBlogConfirm] = useState(false);
  const [targetBlogId, setTargetBlogId] = useState(null);

  const [showCommentConfirm, setShowCommentConfirm] = useState(false);
  const [targetComment, setTargetComment] = useState(null); 

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
    const fetchUserBlogs = async () => {
      setLoading(true);
      if (!user) {
          setLoading(false);
          return;
      }
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/blogs/user/me`);
        setBlogs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching user blogs:", err.response?.data || err.message);
        setError("Looks like you haven't written any blogs yet — start your first one now!");
      } finally {
        setLoading(false);
      }
    };
    fetchUserBlogs();
  }, [user]);


  const handleDeleteBlog = async (id) => {
    const originalBlogs = [...blogs];
    setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== id));

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/blogs/${id}`);
      toast.success("Blog deleted!");
    } catch (error) {
      console.error("Error deleting blog:", error.response?.data || error.message);
      toast.error(`Failed to delete blog: ${error.response?.data?.message || "Please try again."}`);
      setBlogs(originalBlogs); 
    } finally {
        setShowBlogConfirm(false);
        setTargetBlogId(null);
    }
  };

  const confirmDeleteBlog = (id) => {
    setTargetBlogId(id);
    setShowBlogConfirm(true);
  };


  const handleDeleteCommentConfirmed = async () => {
    if (!targetComment) return;

    const { blogId, commentId } = targetComment;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/blogs/comment/${blogId}/${commentId}`);
      
      const updatedBlogs = blogs.map((blog) =>
        blog._id === blogId ? 
        { ...blog, comments: blog.comments.filter((c) => c._id !== commentId) } 
        : blog
      );
      setBlogs(updatedBlogs);
      toast.success("Comment deleted!");

    } catch (error) {
      console.error("Error deleting comment:", error.response?.data || error.message);
      toast.error(`Failed to delete comment: ${error.response?.data?.message || "Please try again."}`);
    } finally {
        setShowCommentConfirm(false);
        setTargetComment(null);
    }
  };

  const confirmDeleteComment = (blogId, commentId) => {
    setTargetComment({ blogId, commentId });
    setShowCommentConfirm(true);
  };

  

  if (loading) return <p style={styles.loadingText}>Loading your content...</p>;
  if (error) return <p style={{...styles.loadingText, color: "#EF4444"}}>{error}</p>;
  if (!user) return <p style={styles.loadingText}>Please log in to view your blogs.</p>

  return (
    <div style={styles.pageContainer}>
      <h2 style={styles.heading}>My Blogs</h2>

      {blogs.length === 0 ? (
        <p style={styles.noBlogsMessage}>
            No blogs found. <Link to="/create" style={styles.link}>Start writing your first blog now!</Link>
        </p>
      ) : (
        <div style={styles.blogsGrid}>
          {blogs.map((blog) => (
            <div
              key={blog._id}
              style={styles.blogCard}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {blog.image && (
                <img
                  src={blog.image.startsWith("http") ? blog.image : `${import.meta.env.VITE_API_URL}/${blog.image}`}
                  alt={blog.title}
                  style={styles.blogImage}
                  onError={(e) => (e.target.src = "https://placehold.co/600x400/eeeeee/787878?text=Image+Not+Found")}
                />
              )}

              <div style={styles.cardContent}>
                  <p style={styles.blogGenre}>Genre: {blog.genre || "Unknown"}</p>
                  <h3 style={styles.blogTitle}>{blog.title}</h3>
                  <p style={styles.blogContent}>{blog.content.slice(0, 250)}...</p>

                  <div style={styles.metadataRow}>
                      <span style={styles.metadataText}>{blog.likes?.length || 0} likes</span>
                      <span style={styles.metadataText}>
                        {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                  </div>

                  <div style={styles.buttonRow}>
                      <button
                        style={{...styles.actionButton, backgroundColor: "#3B82F6"}}
                        onClick={() => navigate(`/edit/${blog._id}`)}
                      >
                        Edit
                      </button>
                      <button
                        style={{...styles.actionButton, backgroundColor: "#EF4444"}}
                        onClick={() => confirmDeleteBlog(blog._id)}
                      >
                        Delete
                      </button>
                      <Link to={`/blogs/${blog._id}`} style={{...styles.actionButton, backgroundColor: "#10B981", textDecoration: 'none', textAlign: 'center'}}>
                        View
                      </Link>
                  </div>

                  <h4 style={styles.commentsHeading}>Comments ({blog.comments?.length || 0})</h4>
                  <div style={styles.commentsList}>
                    {blog.comments && blog.comments.length > 0 ? (
                      blog.comments.map((comment) => (
                        <div key={comment._id} style={styles.commentItem}>
                          <p style={styles.commentText}>
                            <strong>{comment.postedBy?.username || 'User'}:</strong> {comment.text}
                          </p>
                          {comment.postedBy?._id === user?._id && (
                            <button
                              style={styles.deleteCommentButton}
                              onClick={() => confirmDeleteComment(blog._id, comment._id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p style={styles.noCommentsText}>No comments yet.</p>
                    )}
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showBlogConfirm && (
        <ConfirmationModal
          title="Confirm Blog Deletion"
          message="Are you sure you want to permanently delete this blog post?"
          onConfirm={() => handleDeleteBlog(targetBlogId)}
          onCancel={() => setShowBlogConfirm(false)}
        />
      )}

      {showCommentConfirm && (
        <ConfirmationModal
          title="Confirm Comment Deletion"
          message="Are you sure you want to delete this comment? This action cannot be undone."
          onConfirm={handleDeleteCommentConfirmed}
          onCancel={() => setShowCommentConfirm(false)}
        />
      )}
    </div>
  );
};

const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div style={modalStyles.backdrop}>
            <div style={modalStyles.modal}>
                <h3 style={modalStyles.title}>{title}</h3>
                <p style={modalStyles.message}>{message}</p>
                <div style={modalStyles.buttonGroup}>
                    <button
                        onClick={onConfirm}
                        style={{ ...modalStyles.button, backgroundColor: "#EF4444" }}
                    >
                        Confirm Delete
                    </button>
                    <button
                        onClick={onCancel}
                        style={{ ...modalStyles.button, backgroundColor: "#9CA3AF" }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Styles ---

const styles = {
    pageContainer: {
        maxWidth: "1200px",
        margin: "32px auto",
        padding: "16px",
        fontFamily: "Inter, sans-serif",
    },
    heading: {
        fontSize: "2.5rem",
        fontWeight: "800",
        marginBottom: "24px",
        color: "#1F2937",
        borderBottom: "2px solid #10B981",
        paddingBottom: "8px",
    },
    loadingText: {
        fontSize: "1.25rem",
        textAlign: "center",
        marginTop: "40px",
        color: "#1F2937",
    },
    blogsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px",
    },
    blogCard: {
        border: "1px solid #E5E7EB",
        borderRadius: "16px",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.05)",
        backgroundColor: "white",
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        cursor: "default",
        display: "flex",
        flexDirection: "column",
        overflow: 'hidden'
    },
    blogImage: {
        width: "100%",
        height: "200px", 
        objectFit: "cover",
        borderBottom: "1px solid #E5E7EB",
    },
    cardContent: {
        padding: "16px",
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    blogGenre: {
        fontSize: "0.8rem",
        color: "#10B981", 
        fontWeight: "bold",
        marginBottom: "4px",
    },
    blogTitle: {
        fontSize: "1.5rem",
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: "8px",
        lineHeight: 1.3,
    },
    blogContent: {
        color: "#4B5563",
        fontSize: "1rem",
        marginBottom: "16px",
        lineHeight: "1.6",
        flexGrow: 1,
    },
    metadataRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "8px",
        borderTop: "1px solid #F3F4F6",
        paddingTop: "8px",
    },
    metadataText: {
        color: "#6B7280",
        fontSize: "0.9rem",
    },
    buttonRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "16px",
        marginBottom: "20px",
    },
    actionButton: {
        color: "white",
        padding: "10px 16px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontWeight: "600",
        flex: 1,
        marginLeft: '4px',
        marginRight: '4px',
        transition: "background-color 0.2s",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    commentsHeading: {
        marginTop: "16px",
        marginBottom: "8px",
        color: "#4B5563",
        fontSize: "1.1rem",
        fontWeight: "600",
        borderTop: "1px solid #E5E7EB",
        paddingTop: "12px",
    },
    commentsList: {
        maxHeight: '150px',
        overflowY: 'auto',
        paddingRight: '8px'
    },
    commentItem: {
        borderBottom: "1px dashed #E5E7EB",
        padding: "8px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    commentText: {
        color: "#1F2937",
        fontSize: "0.9rem",
        lineHeight: 1.4,
        marginRight: '10px',
    },
    deleteCommentButton: {
        backgroundColor: "#FEE2E2", 
        color: "#EF4444", 
        padding: "4px 8px",
        borderRadius: "6px",
        border: "1px solid #EF4444",
        fontSize: "0.75rem",
        cursor: "pointer",
        transition: "background-color 0.2s",
        flexShrink: 0,
    },
    noCommentsText: {
        color: "#9CA3AF",
        fontSize: "0.9rem",
        textAlign: "center",
        padding: "10px 0",
    },
    noBlogsMessage: {
        color: "#4B5563",
        fontSize: "1.2rem",
        textAlign: "center",
        padding: "40px",
        border: "1px dashed #D1D5DB",
        borderRadius: "12px",
        backgroundColor: "#F9FAFB",
    },
    link: {
        color: "#10B981",
        fontWeight: "bold",
        textDecoration: "underline",
        marginLeft: '4px',
    }
};

const modalStyles = {
    backdrop: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modal: {
        backgroundColor: "white",
        padding: "24px",
        borderRadius: "12px",
        textAlign: "center",
        maxWidth: "440px",
        width: "90%",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
        fontFamily: "Inter, sans-serif",
    },
    title: {
        marginBottom: "16px",
        color: "#1F2937",
        fontSize: "1.5rem",
        fontWeight: "700",
    },
    message: {
        color: "#4B5563",
        marginBottom: "24px",
        fontSize: "1rem",
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "center",
        gap: "16px",
    },
    button: {
        padding: "10px 20px",
        borderRadius: "8px",
        border: "none",
        color: "white",
        fontWeight: "600",
        cursor: "pointer",
        transition: "opacity 0.2s",
    }
};

export default MyBlogs;
