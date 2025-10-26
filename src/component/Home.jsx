import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      toast.success(`Searching for "${searchQuery}"...`, {
        icon: "🔍",
        duration: 2000,
      });
    } else {
      toast.error("Please enter a search term", {
        icon: "⚠️",
        duration: 2000,
      });
    }
  };

  const handleGetStarted = () => {
    toast.success("Welcome to AgroConnect! Let's create your account.", {
      icon: "🎉",
      duration: 2500,
    });
    setTimeout(() => navigate("/signup"), 1000);
  };

  const handleLearnMore = () => {
    toast.info("Scroll down to learn more about our features!", {
      icon: "ℹ️",
      duration: 2000,
    });
    // Smooth scroll to features section
    document.querySelector(".features-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleNavigation = (path, message) => {
    if (message) {
      toast.loading(message, {
        duration: 1000,
      });
    }
    setTimeout(() => {
      navigate(path);
    }, 1000);
  };

  return (
    <div className="home-page">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <a className="navbar-brand fw-bold fs-4" href="/">
            🌾 AgroConnect
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center gap-3">
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Products
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Contact
                </a>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-outline-success"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-success fw-bold"
                  onClick={() => navigate("/signup")}
                >
                  SIGN UP
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6}>
              <h1 className="hero-title">Welcome to AgroConnect</h1>
              <p className="hero-subtitle">
                Connecting farmers with customers. Fresh produce from farm to
                your table.
              </p>
              <div className="hero-buttons">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleGetStarted}
                >
                  Get Started
                </button>
                <button
                  className="btn btn-outline-primary btn-lg"
                  onClick={handleLearnMore}
                >
                  Learn More
                </button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="hero-image">
                <span className="hero-emoji">🌾</span>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Search Section */}
      <section className="search-section py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8}>
              <form className="d-flex" onSubmit={handleSearch}>
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Search for products, farmers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-success" type="submit">
                  Search
                </button>
              </form>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <h2 className="text-center mb-5">Why Choose Us</h2>
          <Row className="g-4">
            <Col md={4}>
              <div className="feature-box text-center">
                <div className="feature-icon">🌱</div>
                <h4>Fresh Products</h4>
                <p>Direct from farm to table</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-box text-center">
                <div className="feature-icon">🤝</div>
                <h4>Fair Prices</h4>
                <p>Best prices for farmers and customers</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-box text-center">
                <div className="feature-icon">📦</div>
                <h4>Fast Delivery</h4>
                <p>Quick delivery to your doorstep</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="footer">
        <Container>
          <div className="text-center">
            <p>&copy; 2025 AgroConnect. All rights reserved.</p>
          </div>
        </Container>
      </footer>

      <Toaster />
    </div>
  );
};

export default Home;
