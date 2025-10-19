import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import debounce from "lodash.debounce"; 

axios.defaults.withCredentials = true;

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const navigate = useNavigate();

  const fetchResults = useCallback(async (term) => {
    if (!term.trim()) {
      setResults([]);
      setNoResults(false);
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/blogs/search?query=${term}`,
        { withCredentials: true }
      );

      if (data.length > 0) {
        setResults(data);
        setNoResults(false);
      } else {
        setResults([]);
        setNoResults(true);
      }
    } catch (err) {
      console.error("Error searching blogs:", err);
      setResults([]);
      setNoResults(true);
    }

    setLoading(false);
  }, []); 

  const debouncedSearch = useMemo(() => debounce(fetchResults, 500), [fetchResults]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handleResultClick = (blogId) => {
    setSearchTerm("");
    setResults([]);
    setNoResults(false);
    navigate(`/blogs/${blogId}`);
  };

  return (
    <div 
      style={{ 
        position: "relative", 
        width: "100%", 
        maxWidth: "400px" 
      }}
    >
      <input
        type="text"
        placeholder="Search blogs..."
        value={searchTerm}
        onChange={handleSearch}
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "1rem",
          width: "100%", 
          outline: "none",
          fontFamily: "Inter, Arial, sans-serif",
          boxSizing: "border-box", 
        }}
      />
      {(searchTerm.trim() && (results.length > 0 || noResults || loading)) && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "5px",
            backgroundColor: "#fff",
            color: "black",
            listStyle: "none",
            padding: "0",
            margin: "0",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            zIndex: 20,
            width: "100%", 
            borderRadius: "5px",
            maxHeight: "250px", 
            overflowY: "auto",
            fontFamily: "Inter, Arial, sans-serif",
          }}
        >
          {loading && <li style={{ padding: "10px", color: "#666" }}>Loading...</li>}

          {results.map((blog) => (
            <li
              key={blog._id}
              onClick={() => handleResultClick(blog._id)}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                transition: "background 0.2s",
                fontSize: "0.9rem",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
            >
              {blog.title}
            </li>
          ))}

          {noResults && <li style={{ padding: "10px", color: "#999" }}>Sorry, no blogs found.</li>}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
