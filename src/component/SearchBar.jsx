import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import debounce from "lodash.debounce"; 

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const navigate = useNavigate();

  const fetchResults = async (term) => {
    if (!term.trim()) {
      setResults([]);
      setNoResults(false);
      return;
    }

    setLoading(true);

    try {
      console.log("Searching for:", term);
      const { data } = await axios.get(`http://localhost:5000/api/blogs/search?query=${term}`);

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
  };

 
  const debouncedSearch = useCallback(debounce(fetchResults, 500), []);

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
    <div style={{ position: "relative", width: "250px" }}>
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
        }}
      />
      {(results.length > 0 || noResults) && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            backgroundColor: "#fff",
            color:"black",
            listStyle: "none",
            padding: "10px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            zIndex: 20,
            width: "100%",
            borderRadius: "5px",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {loading && <li style={{ padding: "5px", color: "#666" }}>Loading...</li>}

          {results.map((blog) => (
            <li
              key={blog._id}
              onClick={() => handleResultClick(blog._id)}
              style={{
                padding: "8px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
            >
              {blog.title}
            </li>
          ))}

          {noResults && <li style={{ padding: "8px", color: "#999" }}> Sorry, no blogs found.</li>}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
