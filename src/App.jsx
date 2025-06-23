import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./component/Layout";
import Home from "./pages/Home"
import Register from "./pages/register";
import OtpVerification from "./pages/VerifyOtp";
import Login from "./pages/login";
import BlogDetails from "./pages/BlogDetalis";
import CreateBlog from "./pages/CreateBlog";
import MyBlogs from "./pages/MyBlogs";
import AdminDashboard from "./pages/AdminDashboard";
import ErrorPage from "./pages/ErrorPage";
import EditBlog from "./pages/EditBlog";
import GenreBlogs from "./pages/GenreBlogs";

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<OtpVerification />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blogs/:id" element={<BlogDetails />} />

                <Route path="/create" element={<CreateBlog />} />
                <Route path="/myblogs" element={<MyBlogs />} />
                
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/edit/:id" element={<EditBlog />} />
                <Route path="/genre/:genre" element={<GenreBlogs />} />
              </Routes>
            </Layout>
          }
        />
        <Route path="*" element={<ErrorPage />} /> 

      </Routes>
    </Router>
  );
}

export default App;
