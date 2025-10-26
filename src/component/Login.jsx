import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const signupMessage = location.state?.message;
  const signupEmail = location.state?.email;

  const [activeTab, setActiveTab] = useState("buyer");
  const [formData, setFormData] = useState({
    email: signupEmail || "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (signupMessage) {
      toast.success(signupMessage, {
        icon: "✅",
        duration: 4000,
      });
    }
  }, [signupMessage]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (errors.general) {
      setErrors({ ...errors, general: "" });
    }
  };

  const handleTabChange = (tabType) => {
    setActiveTab(tabType);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      setErrors({});

      try {
        const response = await axios.get("https://backend-for-agroconnect-y2b7.onrender.com/users");
        const users = response.data;

        const user = users.find(
          (u) => u.email === formData.email && u.password === formData.password
        );

        if (user) {
          if (user.userType !== activeTab) {
            setErrors({
              general: `This account is registered as a ${user.userType.toUpperCase()}. Please select the correct user type tab.`,
            });
            toast.error(
              `This account is registered as a ${user.userType.toUpperCase()}. Please switch tabs.`,
              {
                icon: "⚠️",
                duration: 4000,
              }
            );
            setLoading(false);
            return;
          }

          console.log("Login successful:", user);

          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              userType: user.userType,
              phone: user.phone,
              address: user.address,
            })
          );

          toast.success(`Welcome back, ${user.fullName}!`, {
            icon: "👋",
            duration: 3000,
            style: {
              border: "2px solid #4caf50",
              padding: "16px",
              fontWeight: "bold",
            },
          });

          setTimeout(() => {
            if (user.userType === "seller") {
              navigate("/seller-dashboard");
            } else if (user.userType === "buyer") {
              navigate("/buyer-dashboard");
            } else {
              setErrors({
                general: "Invalid user type. Please contact support.",
              });
              toast.error("Invalid user type. Please contact support.", {
                icon: "❌",
              });
            }
          }, 1500);
        } else {
          setErrors({
            general: "Invalid email or password. Please try again.",
          });
          toast.error("Invalid email or password. Please try again.", {
            icon: "❌",
            duration: 4000,
          });
        }
      } catch (error) {
        console.error("Login error:", error);

        if (error.response) {
          setErrors({
            general: "Server error. Please try again later.",
          });
          toast.error("Server error. Please try again later.", {
            icon: "⚠️",
          });
        } else if (error.request) {
          setErrors({
            general:
              "Unable to connect to server. Please check if JSON Server is running on http://localhost:3000",
          });
          toast.error(
            "Unable to connect to server. Please check if JSON Server is running.",
            {
              icon: "⚠️",
              duration: 5000,
            }
          );
        } else {
          setErrors({
            general: "An error occurred. Please try again.",
          });
          toast.error("An error occurred. Please try again.", {
            icon: "❌",
          });
        }
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError, {
        icon: "⚠️",
      });
    }
  };

  return (
    <div className="login-page">
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
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container-fluid px-5">
          <a className="navbar-brand fw-bold fs-5" href="/">
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
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNav"
          >
            <ul className="navbar-nav align-items-center gap-3">
              <li className="nav-item">
                <div
                  className="nav-link"
                  onClick={() => navigate("/")}
                  style={{ cursor: "pointer" }}
                >
                  HOME
                </div>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-warning fw-bold px-4"
                  onClick={() => navigate("/signup")}
                >
                  GET STARTED
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Container fluid className="main-section">
        <Row className="g-0 min-vh-100">
          {/* Left Side - Welcome Section */}
          <Col
            lg={6}
            className="welcome-section d-flex align-items-center justify-content-center"
          >
            <div className="welcome-content text-white p-5">
              <p className="welcome-label mb-2">WELCOME BACK TO</p>
              <h1 className="brand-title mb-2">AgroConnect</h1>
              <div className="brand-decoration mb-3">
                <span className="leaf-icon">🌾</span>
              </div>
              <p className="brand-tagline mb-4">
                Bridging Agricultural Excellence
              </p>
              <button
                className="btn btn-learn-more"
                onClick={() => navigate("/")}
              >
                LEARN MORE
              </button>
            </div>
          </Col>

          {/* Right Side - Login Form */}
          <Col
            lg={6}
            className="login-section d-flex align-items-center justify-content-center p-4"
          >
            <div className="login-box">
              {/* User Avatar */}
              <div className="user-avatar">
                <div className="avatar-circle">
                  {activeTab === "seller" ? (
                    <span style={{ fontSize: "50px" }}>👨‍🌾</span>
                  ) : (
                    <span style={{ fontSize: "50px" }}>🛒</span>
                  )}
                </div>
              </div>

              {/* User Type Tabs */}
              <div className="user-tabs">
                <button
                  type="button"
                  className={`tab-button ${
                    activeTab === "buyer" ? "active" : ""
                  }`}
                  onClick={() => handleTabChange("buyer")}
                  disabled={loading}
                >
                  🛒 BUYER
                </button>
                <button
                  type="button"
                  className={`tab-button ${
                    activeTab === "seller" ? "active" : ""
                  }`}
                  onClick={() => handleTabChange("seller")}
                  disabled={loading}
                >
                  👨‍🌾 SELLER
                </button>
              </div>

              <div className="text-center mb-3">
                <small className="text-muted">
                  Logging in as:{" "}
                  <strong className="text-success">
                    {activeTab.toUpperCase()}
                  </strong>
                </small>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="login-form">
                <h5 className="form-title text-center mb-4 fw-bold">
                  USER LOGIN
                </h5>

                {errors.general && (
                  <div className="alert alert-danger py-2" role="alert">
                    {errors.general}
                  </div>
                )}

                <div className="form-group mb-3">
                  <input
                    type="email"
                    name="email"
                    className={`form-control form-input ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="form-group mb-3 position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={`form-control form-input ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      zIndex: 10,
                    }}
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="#999"
                      >
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="#999"
                      >
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                    )}
                  </span>
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>

                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label
                    className="form-check-label text-muted"
                    htmlFor="rememberMe"
                  >
                    Remember Me
                  </label>
                  <a
                    href="#"
                    className="float-end text-decoration-none small text-muted"
                  >
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="btn btn-login w-100 fw-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Logging in...
                    </>
                  ) : (
                    `LOGIN AS ${activeTab.toUpperCase()}`
                  )}
                </button>

                <div className="text-center mt-3">
                  <span className="text-muted">Don't have an account? </span>
                  <button
                    type="button"
                    className="btn-link text-decoration-none fw-bold border-0 bg-transparent p-0"
                    onClick={() => navigate("/signup")}
                    style={{ color: "#4caf50", cursor: "pointer" }}
                    disabled={loading}
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
