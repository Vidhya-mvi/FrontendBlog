import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteBlogId, setDeleteBlogId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [userRes, blogRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
            withCredentials: true,
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/blogs`, {
            withCredentials: true,
          }),
        ]);

        setUsers(userRes.data || []);
        setBlogs(blogRes.data || []);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const confirmDeleteBlog = (blogId) => {
    setDeleteBlogId(blogId);
  };

  const handleDeleteBlog = async () => {
    if (!deleteBlogId) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/blogs/${deleteBlogId}`, {
        withCredentials: true,
      });
      setBlogs((prevBlogs) =>
        prevBlogs.filter((blog) => blog._id !== deleteBlogId)
      );
      setDeleteBlogId(null);
    } catch (err) {
      console.error("Failed to delete blog:", err);
      setError("Failed to delete the blog. Try again.");
    }
  };

  const chartData = [
    { name: "Users", count: users.length },
    { name: "Blogs", count: blogs.length },
  ];

  
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  if (loading) return <p style={styles.loadingText}>Loading dashboard...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Admin Dashboard</h1>
      {error && <p style={styles.error}>{error}</p>}

    
      <div style={styles.chartContainer}>
        <h2 style={styles.subHeader}>Users & Blogs Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip 
                contentStyle={styles.tooltipContent}
                labelStyle={{ fontWeight: 600, color: '#1F2937' }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px" }}/>
            <Bar dataKey="count" fill="#3B82F6" barSize={30} radius={[4, 4, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

    
      <div style={styles.section}>
        <h2 style={styles.subHeader}>Users ({users.length})</h2>
        {users.length > 0 ? (
          <ul style={styles.list}>
            {users.map((user) => (
              <li key={user._id} style={styles.listItem}>
                <span style={{ fontWeight: "600", color: "#1F2937" }}>{user.name || user.username}</span> 
                <span style={{ color: "#9CA3AF", fontSize: "0.9rem" }}> ({user.email || 'No Email'})</span>
                <strong style={{ float: "right", color: user.role === 'admin' ? '#EF4444' : '#10B981' }}>{user.role}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p style={styles.noData}>No users found.</p>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.subHeader}>All Blogs ({blogs.length})</h2>
        {currentBlogs.length > 0 ? (
          currentBlogs.map((blog) => (
            <div key={blog._id} style={styles.blogCard}>
              <h3 style={styles.blogTitle}>{blog.title}</h3>
              <p style={styles.blogContent}>
                {blog.content.substring(0, 100)}...
              </p>
              <div style={styles.buttonGroup}>
                <button
                  onClick={() => navigate(`/blogs/${blog._id}`)}
                  style={styles.showButton}
                >
                  View Blog
                </button>
                <button
                  onClick={() => confirmDeleteBlog(blog._id)}
                  style={styles.deleteButton}
                >
                  Delete Blog
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={styles.noData}>No blogs found.</p>
        )}

      
        {totalPages > 1 && (
          <div
            style={styles.paginationContainer}
          >
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              style={{
                ...styles.paginationButton,
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              <span style={{marginRight: '5px'}}>&larr;</span> Prev 
            </button>

            <span style={{ fontWeight: "600", color: "#374151", fontSize: "1rem" }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={{
                ...styles.paginationButton,
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              Next <span style={{marginLeft: '5px'}}>&rarr;</span>
            </button>
          </div>
        )}
      </div>

      
      {deleteBlogId && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Confirm Deletion</h2>
            <p style={styles.modalMessage}>Are you sure you want to delete this blog? This action cannot be undone.</p>
            <div style={styles.modalButtons}>
              <button
                onClick={() => setDeleteBlogId(null)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBlog}
                style={styles.confirmDeleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1000px", 
    margin: "0 auto", 
    padding: "1.5rem", 
    fontFamily: "Inter, sans-serif",
    backgroundColor: "#f4f7f9", 
    minHeight: "100vh",
  },
  header: {
    fontSize: "2.5rem", 
    color: "#1f2937",
    marginBottom: "1.5rem",
    fontWeight: "800",
    borderBottom: "3px solid #10b981",
    paddingBottom: "0.5rem",
    '@media (maxWidth: 600px)': {
        fontSize: "2rem"
    }
  },
  loadingText: {
    fontSize: "1.25rem",
    textAlign: "center",
    marginTop: "40px",
    color: "#1F2937",
  },
  error: {
    color: "#ef4444",
    fontWeight: "600",
    backgroundColor: "#fee2e2",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
  },
  
  chartContainer: {
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    marginBottom: "2rem",
  },
  tooltipContent: { 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    border: '1px solid #E5E7EB', 
    borderRadius: '6px',
    padding: '8px'
  },
  
  section: {
    marginBottom: "2rem",
  },
  subHeader: {
    fontSize: "1.5rem",
    color: "#374151",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "0.5rem",
    marginBottom: "1rem",
    fontWeight: "700",
  },
  
  list: {
    listStyle: "none",
    padding: "0",
    color: "black",
  },
  listItem: {
    padding: "0.75rem 0",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap", 
  },
  
  blogCard: {
    padding: "1rem",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "1rem",
    backgroundColor: "#fff",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  blogTitle: {
    fontSize: "1.25rem",
    color: "#1f2937",
    marginBottom: "0.25rem",
    fontWeight: "600",
  },
  blogContent: {
    color: "#6b7280",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },
  buttonGroup: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "1rem",
    flexDirection: "row", 
    '@media (maxWidth: 400px)': {
        flexDirection: "column",
    }
  },
  baseButton: {
    border: "none",
    padding: "0.625rem 1rem",
    cursor: "pointer",
    borderRadius: "6px",
    fontWeight: "600",
    flexGrow: 1, 
    transition: "background-color 0.2s, transform 0.1s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  showButton: {
    ...this.baseButton,
    backgroundColor: "#3b82f6", 
    color: "#fff",
  },
  deleteButton: {
    ...this.baseButton,
    backgroundColor: "#ef4444", 
    color: "#fff",
  },
  
  noData: {
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    padding: "1.25rem",
    backgroundColor: "#fff",
    borderRadius: "8px",
  },

  paginationContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginTop: "1.5rem",
    alignItems: "center",
    padding: "0.5rem 0",
    flexWrap: 'wrap', 
  },
  paginationButton: {
    backgroundColor: "#10b981", 
    color: "#fff",
    border: "none",
    padding: "0.625rem 1rem",
    cursor: "pointer",
    borderRadius: "6px",
    fontWeight: "600",
    transition: "background-color 0.2s, opacity 0.2s",
    display: "flex",
    alignItems: "center",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
    color: "black",
    maxWidth: "400px", 
    width: "90%", 
  },
  modalTitle: {
      fontSize: "1.5rem", 
      color: "#EF4444", 
      marginBottom: "0.5rem",
  },
  modalMessage: {
      color: "#4B5563",
      marginBottom: "1.5rem",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "1.25rem",
    gap: "0.75rem",
    flexDirection: "row", 
    '@media (maxWidth: 400px)': {
        flexDirection: "column",
    }
  },
  cancelButton: {
    ...this.baseButton,
    backgroundColor: "#9CA3AF",
    color: "#fff",
    flexGrow: 1,
  },
  confirmDeleteButton: {
    ...this.baseButton,
    backgroundColor: "#EF4444",
    color: "#fff",
    flexGrow: 1,
  },
};

export default AdminDashboard;
