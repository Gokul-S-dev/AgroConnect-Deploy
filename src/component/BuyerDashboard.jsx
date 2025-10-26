import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    console.log("Current user from localStorage:", user);

    if (!user || user.userType !== "buyer") {
      toast.error("Please login as a buyer to access this page", {
        icon: "🚫",
        duration: 3000,
      });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }
    setCurrentUser(user);
    fetchProducts();

    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      console.log("Fetching all products from API...");
      const response = await axios.get("http://localhost:3000/products");
      console.log("Fetched products:", response.data);
      setProducts(response.data);

      toast.success(`Loaded ${response.data.length} products successfully!`, {
        icon: "📦",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(
        "Failed to load products. Please check if JSON Server is running on http://localhost:3000",
        {
          icon: "⚠️",
          duration: 4000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("cart");
    toast.success("Logged out successfully!", {
      icon: "👋",
      duration: 2000,
    });
    setTimeout(() => navigate("/login"), 1000);
  };

  const handleAddToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      toast.success(`Increased quantity of "${product.name}" in cart!`, {
        icon: "➕",
        duration: 2000,
      });
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
      toast.success(`"${product.name}" added to cart!`, {
        icon: "🛒",
        duration: 2500,
        style: {
          border: "2px solid #4caf50",
          padding: "16px",
          fontWeight: "bold",
        },
      });
    }

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div
          className="spinner-border text-success"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-3 fs-5">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Toast Container */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#363636",
            fontSize: "16px",
            fontWeight: "500",
          },
          success: {
            duration: 3000,
            style: {
              background: "#d4edda",
              border: "1px solid #c3e6cb",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "#f8d7da",
              border: "1px solid #f5c6cb",
            },
          },
        }}
      />

      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
        <div className="container-fluid px-4">
          <a className="navbar-brand fw-bold fs-4" href="#">
            🌾 AgroConnect - Buyer
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNav"
          >
            <ul className="navbar-nav align-items-center gap-3">
              <li className="nav-item">
                <span className="text-white">
                  Welcome, <strong>{currentUser?.fullName}</strong>
                </span>
              </li>
              <li className="nav-item">
                <span className="badge bg-light text-success fs-6">
                  🛒 {cart.length}
                </span>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-outline-light"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-success"
                  onClick={() => navigate("/chat")}
                >
                  💬 Community Chat
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-info text-white"
                  onClick={() => navigate("/calendar")}
                >
                  📅 Calendar
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mt-4">
        {/* Welcome Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-gradient-success text-white">
              <div className="card-body p-4">
                <h2 className="mb-2">
                  👋 Welcome Back, {currentUser?.fullName}!
                </h2>
                <p className="mb-0">
                  Browse fresh products directly from local farmers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <div className="stat-icon">🛒</div>
                <h3 className="stat-number">{cart.length}</h3>
                <p className="stat-label">Items in Cart</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <div className="stat-icon">📦</div>
                <h3 className="stat-number">0</h3>
                <p className="stat-label">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <div className="stat-icon">⭐</div>
                <h3 className="stat-number">{products.length}</h3>
                <p className="stat-label">Available Products</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="search-box">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="🔍 Search products, farmers, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Products Section Header */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0 fw-bold">
                🛒 Available Products
                <span className="badge bg-success ms-2">
                  {filteredProducts.length} Products
                </span>
              </h4>
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-muted mt-2">
                Showing results for: <strong>"{searchQuery}"</strong>
              </p>
            )}
          </div>
        </div>

        {/* Products Grid - ALL PRODUCTS DISPLAYED */}
        <div className="row mb-4">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading products...</span>
              </div>
              <p className="mt-3 text-muted">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="col-md-6 col-lg-4 col-xl-3 mb-4">
                <div className="card product-card h-100 shadow-sm hover-shadow">
                  <div className="card-body d-flex flex-column">
                    {/* Product Image/Emoji */}
                    <div
                      className="product-image text-center mb-3"
                      style={{ fontSize: "80px" }}
                    >
                      {product.image}
                    </div>

                    {/* Product Name */}
                    <h5 className="product-name fw-bold text-center mb-2">
                      {product.name}
                    </h5>

                    {/* Product Price */}
                    <div className="text-center mb-3">
                      <span className="product-price text-success fw-bold fs-4">
                        {product.price.includes("₹")
                          ? product.price
                          : `₹${product.price}`}
                      </span>
                    </div>

                    {/* Product Details */}
                    <div className="product-info mt-auto">
                      <div className="d-flex align-items-center mb-2">
                        <span className="text-muted small">
                          👨‍🌾 <strong>{product.farmer}</strong>
                        </span>
                      </div>

                      <div className="d-flex align-items-center mb-2">
                        <span className="text-muted small">
                          📍 {product.location}
                        </span>
                      </div>

                      <div className="d-flex align-items-center mb-3">
                        <span className="text-warning small">
                          ⭐ {product.rating} / 5.0
                        </span>
                      </div>

                      {/* Product ID (for reference) */}
                      <div className="text-muted small mb-3">
                        ID: {product.id}
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        className="btn btn-success w-100 fw-bold"
                        onClick={() => handleAddToCart(product)}
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info text-center py-5">
                <div style={{ fontSize: "80px" }}>📭</div>
                <h5 className="mt-3">No Products Found</h5>
                <p className="mb-0">
                  {searchQuery
                    ? `No products match your search for "${searchQuery}"`
                    : "No products available at the moment. Please check back later."}
                </p>
                {searchQuery && (
                  <button
                    className="btn btn-primary mt-3"
                    onClick={() => setSearchQuery("")}
                  >
                    View All Products
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Products Summary Info */}
        {!loading && products.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-success">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>✅ All Products Loaded Successfully!</strong>
                    <br />
                    <small>
                      Showing {filteredProducts.length} of {products.length}{" "}
                      total products from local farmers
                    </small>
                  </div>
                  <div className="text-end">
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={fetchProducts}
                    >
                      🔄 Refresh Products
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info - Remove in production */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="fw-bold">📊 Dashboard Statistics</h6>
                <ul className="mb-0 small">
                  <li>
                    Total Products in Database:{" "}
                    <strong>{products.length}</strong>
                  </li>
                  <li>
                    Filtered Products Shown:{" "}
                    <strong>{filteredProducts.length}</strong>
                  </li>
                  <li>
                    Items in Cart: <strong>{cart.length}</strong>
                  </li>
                  <li>
                    Search Query: <strong>{searchQuery || "None"}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
