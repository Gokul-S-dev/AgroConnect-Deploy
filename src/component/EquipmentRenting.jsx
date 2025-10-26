import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";

const EquipmentRenting = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    type: "Tractor",
    price: "",
    image: "🚜",
    specifications: "",
    condition: "Excellent",
    available: true,
    rating: 4.5,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    console.log("Current user from localStorage:", user);

    if (!user || user.userType !== "seller") {
      toast.error("Please login as a seller to access this page", {
        icon: "🚫",
        duration: 3000,
      });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }
    setCurrentUser(user);
    fetchEquipment();
  }, [navigate]);

  const fetchEquipment = async () => {
    try {
      console.log("Fetching equipment...");

      // Get equipment from localStorage only (editable data)
      const localEquipment = JSON.parse(
        localStorage.getItem("allEquipment") || "[]"
      );

      // Try to load from data.json only on first load
      if (localEquipment.length === 0) {
        try {
          const response = await fetch("/Data/data.json");
          const data = await response.json();

          if (data.equipment && data.equipment.length > 0) {
            // Copy data.json equipment to localStorage so it becomes editable
            const equipmentWithIds = data.equipment.map((eq, index) => ({
              ...eq,
              id: eq.id || Date.now() + index, // Ensure each has an ID
              isFromJson: true, // Mark as originally from JSON
            }));

            localStorage.setItem(
              "allEquipment",
              JSON.stringify(equipmentWithIds)
            );
            setEquipment(equipmentWithIds);
            console.log(
              "Loaded equipment from data.json to localStorage:",
              equipmentWithIds
            );
          } else {
            setEquipment([]);
          }
        } catch (error) {
          console.log("No data.json file or error loading it:", error);
          setEquipment([]);
        }
      } else {
        setEquipment(localEquipment);
        console.log("Loaded equipment from localStorage:", localEquipment);
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast.error("Failed to load equipment data.", {
        icon: "⚠️",
        duration: 4000,
      });
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/seller-dashboard");
  };

  const handleAddEquipment = (e) => {
    e.preventDefault();

    if (!newEquipment.name.trim()) {
      toast.error("Please enter equipment name", {
        icon: "❌",
      });
      return;
    }
    if (!newEquipment.price.trim()) {
      toast.error("Please enter rental price", {
        icon: "❌",
      });
      return;
    }
    if (!newEquipment.specifications.trim()) {
      toast.error("Please enter equipment specifications", {
        icon: "❌",
      });
      return;
    }

    try {
      console.log("Adding new equipment...");

      const addressParts = currentUser.address.split(",");
      const location = addressParts[addressParts.length - 1].trim();

      const equipmentData = {
        id: Date.now(),
        name: newEquipment.name.trim(),
        type: newEquipment.type,
        price: newEquipment.price.includes("₹")
          ? newEquipment.price.trim()
          : `₹${newEquipment.price.trim()}`,
        image: newEquipment.image,
        owner: currentUser.fullName,
        ownerEmail: currentUser.email,
        ownerPhone: currentUser.phone || "Not provided",
        rating: parseFloat(newEquipment.rating),
        location: location || "Unknown",
        specifications: newEquipment.specifications.trim(),
        condition: newEquipment.condition,
        available: newEquipment.available,
        isFromJson: false,
      };

      console.log("Equipment data:", equipmentData);

      // Get current equipment and add new one
      const allEquipment = [...equipment, equipmentData];
      localStorage.setItem("allEquipment", JSON.stringify(allEquipment));
      setEquipment(allEquipment);

      toast.success(`Equipment "${newEquipment.name}" added successfully!`, {
        icon: "🚜",
        duration: 3000,
        style: {
          border: "2px solid #ffc107",
          padding: "16px",
          fontWeight: "bold",
        },
      });

      setShowAddEquipment(false);
      setNewEquipment({
        name: "",
        type: "Tractor",
        price: "",
        image: "🚜",
        specifications: "",
        condition: "Excellent",
        available: true,
        rating: 4.5,
      });
    } catch (error) {
      console.error("Error adding equipment:", error);
      toast.error("Failed to add equipment. Please try again.", {
        icon: "❌",
      });
    }
  };

  const handleDeleteEquipment = (equipmentId, equipmentName) => {
    toast(
      (t) => (
        <div>
          <p className="mb-3">
            <strong>Delete Equipment?</strong>
            <br />
            Are you sure you want to delete "{equipmentName}"?
            <br />
            <small className="text-muted">This will affect all sellers.</small>
          </p>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                confirmDelete(equipmentId, equipmentName);
                toast.dismiss(t.id);
              }}
            >
              Delete
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        icon: "🗑️",
        duration: 5000,
        style: {
          minWidth: "300px",
        },
      }
    );
  };

  const confirmDelete = (equipmentId, equipmentName) => {
    try {
      console.log("Deleting equipment with ID:", equipmentId);

      // Filter out the equipment
      const updatedEquipment = equipment.filter((eq) => eq.id !== equipmentId);

      // Update both state and localStorage
      setEquipment(updatedEquipment);
      localStorage.setItem("allEquipment", JSON.stringify(updatedEquipment));

      toast.success(`Equipment "${equipmentName}" deleted successfully!`, {
        icon: "✅",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("Failed to delete equipment. Please try again.", {
        icon: "❌",
      });
    }
  };

  const handleContactOwner = (eq) => {
    // Show contact information in a toast
    toast(
      (t) => (
        <div>
          <h6 className="mb-3">
            <strong>📞 Contact Owner</strong>
          </h6>
          <p className="mb-2">
            <strong>Equipment:</strong> {eq.name}
          </p>
          <p className="mb-2">
            <strong>Owner:</strong> {eq.owner}
          </p>
          <p className="mb-2">
            <strong>Email:</strong> {eq.ownerEmail || "Not provided"}
          </p>
          <p className="mb-3">
            <strong>Phone:</strong> {eq.ownerPhone || "Not provided"}
          </p>
          <div className="d-flex gap-2">
            {eq.ownerEmail && (
              <a
                href={`mailto:${eq.ownerEmail}?subject=Inquiry about ${eq.name}`}
                className="btn btn-sm btn-success"
                onClick={() => toast.dismiss(t.id)}
              >
                📧 Email
              </a>
            )}
            {eq.ownerPhone && eq.ownerPhone !== "Not provided" && (
              <a
                href={`tel:${eq.ownerPhone}`}
                className="btn btn-sm btn-primary"
                onClick={() => toast.dismiss(t.id)}
              >
                📱 Call
              </a>
            )}
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => toast.dismiss(t.id)}
            >
              Close
            </button>
          </div>
        </div>
      ),
      {
        icon: "📞",
        duration: 10000,
        style: {
          minWidth: "350px",
        },
      }
    );

    console.log("Contact owner:", eq.owner);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEquipment({
      ...newEquipment,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div
          className="spinner-border text-warning"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-3 fs-5">Loading equipment...</p>
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
      <nav className="navbar navbar-expand-lg navbar-dark bg-warning shadow-sm">
        <div className="container-fluid px-4">
          <a className="navbar-brand fw-bold fs-4 text-dark" href="#">
            🚜 AgroConnect - Equipment Renting
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
                <span className="text-dark">
                  Welcome, <strong>{currentUser?.fullName}</strong>
                </span>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-outline-dark"
                  onClick={handleBackToDashboard}
                >
                  ← Back to Dashboard
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
            <div className="card bg-gradient-warning">
              <div className="card-body p-4">
                <h2 className="mb-2 text-dark">
                  🚜 Equipment Renting Management
                </h2>
                <p className="mb-0 text-dark">
                  Manage agricultural equipment rentals - Available to all
                  sellers
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
                <div className="stat-icon">🚜</div>
                <h3 className="stat-number">{equipment.length}</h3>
                <p className="stat-label">Total Equipment</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <div className="stat-icon">✅</div>
                <h3 className="stat-number">
                  {equipment.filter((eq) => eq.available).length}
                </h3>
                <p className="stat-label">Available</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <div className="stat-icon">❌</div>
                <h3 className="stat-number">
                  {equipment.filter((eq) => !eq.available).length}
                </h3>
                <p className="stat-label">Unavailable</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Equipment Button */}
        <div className="row mb-4">
          <div className="col-12">
            <button
              className="btn btn-warning btn-lg fw-bold"
              onClick={() => setShowAddEquipment(!showAddEquipment)}
            >
              {showAddEquipment ? "❌ Cancel" : "➕ Add New Equipment"}
            </button>
          </div>
        </div>

        {/* Add Equipment Form */}
        {showAddEquipment && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow">
                <div className="card-body">
                  <h4 className="mb-3 fw-bold">🚜 Add New Equipment</h4>
                  <form onSubmit={handleAddEquipment}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          Equipment Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          placeholder="e.g., John Deere Tractor 5055E"
                          value={newEquipment.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          Equipment Type *
                        </label>
                        <select
                          name="type"
                          className="form-control form-select"
                          value={newEquipment.type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Tractor">Tractor</option>
                          <option value="Harvester">Harvester</option>
                          <option value="Truck">Truck</option>
                          <option value="Plough">Plough</option>
                          <option value="Seed Drill">Seed Drill</option>
                          <option value="Sprayer">Sprayer</option>
                          <option value="Thresher">Thresher</option>
                          <option value="Cultivator">Cultivator</option>
                          <option value="Rotavator">Rotavator</option>
                          <option value="Water Pump">Water Pump</option>
                          <option value="Trailer">Trailer</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          Rental Price (per day) *
                        </label>
                        <input
                          type="text"
                          name="price"
                          className="form-control"
                          placeholder="e.g., 2000/day"
                          value={newEquipment.price}
                          onChange={handleInputChange}
                          required
                        />
                        <small className="text-muted">
                          Enter price in rupees (₹ will be added automatically)
                        </small>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          Equipment Icon
                        </label>
                        <select
                          name="image"
                          className="form-control form-select"
                          value={newEquipment.image}
                          onChange={handleInputChange}
                        >
                          <option value="🚜">🚜 Tractor</option>
                          <option value="🌾">🌾 Harvester/Thresher</option>
                          <option value="🚚">🚚 Truck</option>
                          <option value="🔧">🔧 Tool/Equipment</option>
                          <option value="💧">💧 Water Pump</option>
                          <option value="🌱">🌱 Seed Drill</option>
                          <option value="🚿">🚿 Sprayer</option>
                          <option value="⚙️">⚙️ Machinery</option>
                        </select>
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="form-label fw-bold">
                          Specifications *
                        </label>
                        <textarea
                          name="specifications"
                          className="form-control"
                          rows="3"
                          placeholder="e.g., 55HP, 4WD, Perfect for heavy farming, Well-maintained"
                          value={newEquipment.specifications}
                          onChange={handleInputChange}
                          required
                        ></textarea>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Condition</label>
                        <select
                          name="condition"
                          className="form-control form-select"
                          value={newEquipment.condition}
                          onChange={handleInputChange}
                        >
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          Initial Rating
                        </label>
                        <select
                          name="rating"
                          className="form-control form-select"
                          value={newEquipment.rating}
                          onChange={handleInputChange}
                        >
                          <option value={5.0}>⭐⭐⭐⭐⭐ (5.0)</option>
                          <option value={4.5}>⭐⭐⭐⭐ (4.5)</option>
                          <option value={4.0}>⭐⭐⭐⭐ (4.0)</option>
                          <option value={3.5}>⭐⭐⭐ (3.5)</option>
                          <option value={3.0}>⭐⭐⭐ (3.0)</option>
                        </select>
                      </div>
                      <div className="col-md-12 mb-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            name="available"
                            className="form-check-input"
                            id="available"
                            checked={newEquipment.available}
                            onChange={handleInputChange}
                          />
                          <label
                            className="form-check-label fw-bold"
                            htmlFor="available"
                          >
                            Available for Rent
                          </label>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="alert alert-info">
                          <strong>ℹ️ Note:</strong> Equipment will be listed
                          with your name (
                          <strong>{currentUser?.fullName}</strong>) and location
                          (
                          <strong>
                            {currentUser?.address.split(",").pop().trim()}
                          </strong>
                          ) and will be <strong>visible to all sellers</strong>
                        </div>
                      </div>
                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-success btn-lg fw-bold w-100"
                        >
                          ✅ Add Equipment to Common Pool
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Equipment Listings */}
        <div className="row mb-4">
          <div className="col-12 mb-3">
            <h4 className="fw-bold">
              🚜 All Equipment Available for Rent
              <span className="badge bg-warning text-dark ms-2">
                {equipment.length} Equipment
              </span>
            </h4>
            <p className="text-muted">
              Shared pool - All sellers can manage these equipment
            </p>
          </div>
          {equipment.length > 0 ? (
            equipment.map((eq) => (
              <div key={eq.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card equipment-card h-100 shadow-sm">
                  <div className="card-body">
                    {/* Equipment Icon */}
                    <div className="equipment-image text-center mb-3">
                      <span style={{ fontSize: "4rem" }}>{eq.image}</span>
                    </div>

                    {/* Equipment Name */}
                    <h5 className="equipment-name fw-bold">{eq.name}</h5>

                    {/* Equipment Type Badge */}
                    <span className="badge bg-warning text-dark mb-3">
                      {eq.type}
                    </span>

                    {/* Rental Price */}
                    <p className="equipment-price fw-bold text-success fs-4">
                      {eq.price}
                    </p>

                    {/* Specifications */}
                    <div className="equipment-specs mb-3">
                      <small className="text-muted">{eq.specifications}</small>
                    </div>

                    {/* Equipment Info */}
                    <div className="equipment-info mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">📍 {eq.location}</small>
                        <small className="text-warning">⭐ {eq.rating}</small>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">
                          Owner: <strong>{eq.owner}</strong>
                        </small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          Condition: <strong>{eq.condition}</strong>
                        </small>
                        <span
                          className={`badge ${
                            eq.available ? "bg-success" : "bg-danger"
                          }`}
                        >
                          {eq.available ? "✓ Available" : "✗ Unavailable"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary btn-sm fw-bold"
                        onClick={() => handleContactOwner(eq)}
                      >
                        📞 Contact Owner
                      </button>
                      <button
                        className="btn btn-danger btn-sm fw-bold"
                        onClick={() => handleDeleteEquipment(eq.id, eq.name)}
                      >
                        🗑️ Delete Listing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info text-center py-5">
                <div style={{ fontSize: "80px" }}>🚜</div>
                <h5 className="mt-3">No Equipment Available Yet</h5>
                <p className="mb-0">
                  No equipment has been added to the system yet. Click "Add New
                  Equipment" button above to get started!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentRenting;
