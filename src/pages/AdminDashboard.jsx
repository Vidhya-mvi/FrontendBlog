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
          axios.get("http://localhost:5000/api/users", {
            withCredentials: true,
          }),
          axios.get("http://localhost:5000/api/blogs", {
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
      await axios.delete(`http://localhost:5000/api/blogs/${deleteBlogId}`, {
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

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Admin Dashboard</h1>
      {error && <p style={styles.error}>{error}</p>}

    
      <div style={styles.chartContainer}>
        <h2 style={styles.subHeader}>Users & Blogs Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    
      <div style={styles.section}>
        <h2 style={styles.subHeader}>Users</h2>
        {users.length > 0 ? (
          <ul style={styles.list}>
            {users.map((user) => (
              <li key={user._id} style={styles.listItem}>
                {user.name || user.username} (<strong>{user.role}</strong>)
              </li>
            ))}
          </ul>
        ) : (
          <p style={styles.noData}>No users found.</p>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.subHeader}>All Blogs</h2>
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
                  Show Blog
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
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "20px",
              alignItems: "center",
            }}
          >
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              style={{
                ...styles.showButton,
                opacity: currentPage === 1 ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>&larr;</span> 
            </button>

            <span style={{ fontWeight: "bold", color: "#000" }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={{
                ...styles.showButton,
                opacity: currentPage === totalPages ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>&rarr;</span>
            </button>
          </div>
        )}
      </div>

      
      {deleteBlogId && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Are you sure?</h2>
            <p>This action cannot be undone.</p>
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
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
  },
  header: {
    fontSize: "32px",
    color: "#333",
    marginBottom: "20px",
  },
  error: {
    color: "red",
    fontWeight: "bold",
  },
  chartContainer: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
  },
  section: {
    marginBottom: "30px",
  },
  subHeader: {
    fontSize: "24px",
    color: "#444",
    borderBottom: "2px solid #ddd",
    paddingBottom: "5px",
    marginBottom: "10px",
  },
  list: {
    listStyle: "none",
    padding: "0",
    color: "black",
  },
  listItem: {
    padding: "8px",
    borderBottom: "1px solid #ddd",
  },
  blogCard: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    marginBottom: "10px",
    backgroundColor: "#fff",
  },
  blogTitle: {
    fontSize: "20px",
    color: "#555",
  },
  blogContent: {
    color: "#666",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  showButton: {
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: "3px",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: "3px",
    fontWeight: "bold",
  },
  noData: {
    color: "#777",
    fontStyle: "italic",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
    color: "black",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "15px",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    color: "#000",
    border: "none",
    padding: "8px 15px",
    cursor: "pointer",
    borderRadius: "5px",
    fontWeight: "bold",
  },
  confirmDeleteButton: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    padding: "8px 15px",
    cursor: "pointer",
    borderRadius: "5px",
    fontWeight: "bold",
  },
};

export default AdminDashboard;
