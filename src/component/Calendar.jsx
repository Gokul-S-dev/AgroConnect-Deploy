import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Calendar.css";

const Calendar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    type: "general",
    location: "",
  });

  const eventTypes = [
    { value: "general", label: "General", color: "#6c757d", icon: "📋" },
    { value: "harvest", label: "Harvest", color: "#28a745", icon: "🌾" },
    { value: "planting", label: "Planting", color: "#20c997", icon: "🌱" },
    { value: "meeting", label: "Meeting", color: "#007bff", icon: "🤝" },
    { value: "delivery", label: "Delivery", color: "#ffc107", icon: "🚚" },
    { value: "market", label: "Market Day", color: "#fd7e14", icon: "🛒" },
    { value: "training", label: "Training", color: "#6f42c1", icon: "📚" },
    {
      value: "maintenance",
      label: "Maintenance",
      color: "#dc3545",
      icon: "🔧",
    },
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
      toast.error("Please login to access calendar", {
        icon: "🚫",
        duration: 3000,
      });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }
    setCurrentUser(user);
    loadEvents();
  }, [navigate]);

  const loadEvents = () => {
    try {
      const storedEvents = JSON.parse(
        localStorage.getItem("calendarEvents") || "[]"
      );
      setEvents(storedEvents);
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Failed to load events", {
        icon: "❌",
      });
    }
  };

  const handleAddEvent = (e) => {
    e.preventDefault();

    if (!newEvent.title.trim()) {
      toast.error("Please enter event title", {
        icon: "❌",
      });
      return;
    }
    if (!newEvent.date) {
      toast.error("Please select event date", {
        icon: "❌",
      });
      return;
    }

    try {
      const eventData = {
        id: Date.now(),
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        date: newEvent.date,
        time: newEvent.time || "All Day",
        type: newEvent.type,
        location: newEvent.location.trim(),
        createdBy: currentUser.fullName,
        createdByEmail: currentUser.email,
        userType: currentUser.userType,
        createdAt: new Date().toISOString(),
      };

      const updatedEvents = [...events, eventData];
      localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents));
      setEvents(updatedEvents);

      const eventTypeInfo = eventTypes.find((et) => et.value === newEvent.type);
      toast.success(
        `${eventTypeInfo.icon} Event "${newEvent.title}" added successfully!`,
        {
          duration: 3000,
          style: {
            border: `2px solid ${eventTypeInfo.color}`,
            padding: "16px",
            fontWeight: "bold",
          },
        }
      );

      setShowAddEvent(false);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "",
        type: "general",
        location: "",
      });
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Failed to add event", {
        icon: "❌",
      });
    }
  };

  const handleDeleteEvent = (eventId, eventTitle) => {
    toast(
      (t) => (
        <div>
          <p className="mb-3">
            <strong>Delete Event?</strong>
            <br />
            Are you sure you want to delete "{eventTitle}"?
          </p>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                try {
                  const updatedEvents = events.filter((e) => e.id !== eventId);
                  localStorage.setItem(
                    "calendarEvents",
                    JSON.stringify(updatedEvents)
                  );
                  setEvents(updatedEvents);
                  toast.dismiss(t.id);
                  toast.success("Event deleted", {
                    icon: "✅",
                  });
                } catch (error) {
                  console.error("Error deleting event:", error);
                  toast.dismiss(t.id);
                  toast.error("Failed to delete event", {
                    icon: "❌",
                  });
                }
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
      }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({
      ...newEvent,
      [name]: value,
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (date) => {
    const dateString = formatDateForComparison(date);
    return events.filter((event) => event.date === dateString);
  };

  const formatDateForComparison = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleBackToDashboard = () => {
    if (currentUser?.userType === "buyer") {
      navigate("/buyer-dashboard");
    } else {
      navigate("/seller-dashboard");
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dateEvents = getEventsForDate(date);
      const isToday =
        formatDateForComparison(date) === formatDateForComparison(new Date());
      const isSelected =
        formatDateForComparison(date) === formatDateForComparison(selectedDate);

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? "today" : ""} ${
            isSelected ? "selected" : ""
          } ${dateEvents.length > 0 ? "has-events" : ""}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="day-number">{day}</div>
          {dateEvents.length > 0 && (
            <div className="event-indicators">
              {dateEvents.slice(0, 3).map((event, index) => {
                const eventTypeInfo = eventTypes.find(
                  (et) => et.value === event.type
                );
                return (
                  <div
                    key={index}
                    className="event-dot"
                    style={{ backgroundColor: eventTypeInfo.color }}
                    title={event.title}
                  ></div>
                );
              })}
              {dateEvents.length > 3 && (
                <span className="more-events">+{dateEvents.length - 3}</span>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="calendar-page">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#363636",
            fontSize: "16px",
            fontWeight: "500",
          },
          success: {
            style: {
              background: "#d4edda",
              border: "1px solid #c3e6cb",
            },
          },
          error: {
            style: {
              background: "#f8d7da",
              border: "1px solid #f5c6cb",
            },
          },
        }}
      />

      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid px-4">
          <a className="navbar-brand fw-bold fs-4" href="#">
            📅 AgroConnect - Calendar & Events
          </a>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white d-none d-md-inline">
              Welcome, <strong>{currentUser?.fullName}</strong>
            </span>
            <button
              className="btn btn-outline-light"
              onClick={handleBackToDashboard}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        {/* Header Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-gradient-primary text-white">
              <div className="card-body p-4">
                <h2 className="mb-2">📅 Calendar & Events Management</h2>
                <p className="mb-0">
                  Manage your agricultural events, meetings, and important dates
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Calendar View */}
          <div className="col-lg-8 mb-4">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <button
                      className="btn btn-sm btn-light me-2"
                      onClick={previousMonth}
                    >
                      ← Prev
                    </button>
                    <button
                      className="btn btn-sm btn-light me-2"
                      onClick={goToToday}
                    >
                      Today
                    </button>
                    <button
                      className="btn btn-sm btn-light"
                      onClick={nextMonth}
                    >
                      Next →
                    </button>
                  </div>
                  <h4 className="mb-0">
                    {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h4>
                  <button
                    className="btn btn-sm btn-warning fw-bold"
                    onClick={() => setShowAddEvent(!showAddEvent)}
                  >
                    {showAddEvent ? "❌ Cancel" : "➕ Add Event"}
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                {/* Add Event Form */}
                {showAddEvent && (
                  <div className="p-4 border-bottom bg-light">
                    <h5 className="mb-3">📝 Add New Event</h5>
                    <form onSubmit={handleAddEvent}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">
                            Event Title *
                          </label>
                          <input
                            type="text"
                            name="title"
                            className="form-control"
                            placeholder="e.g., Wheat Harvest"
                            value={newEvent.title}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">
                            Event Type *
                          </label>
                          <select
                            name="type"
                            className="form-control form-select"
                            value={newEvent.type}
                            onChange={handleInputChange}
                            required
                          >
                            {eventTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.icon} {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">Date *</label>
                          <input
                            type="date"
                            name="date"
                            className="form-control"
                            value={newEvent.date}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">Time</label>
                          <input
                            type="time"
                            name="time"
                            className="form-control"
                            value={newEvent.time}
                            onChange={handleInputChange}
                          />
                          <small className="text-muted">
                            Leave empty for all-day event
                          </small>
                        </div>
                        <div className="col-md-12 mb-3">
                          <label className="form-label fw-bold">Location</label>
                          <input
                            type="text"
                            name="location"
                            className="form-control"
                            placeholder="e.g., Main Farm, Village Market"
                            value={newEvent.location}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-12 mb-3">
                          <label className="form-label fw-bold">
                            Description
                          </label>
                          <textarea
                            name="description"
                            className="form-control"
                            rows="3"
                            placeholder="Event details..."
                            value={newEvent.description}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>
                        <div className="col-12">
                          <button
                            type="submit"
                            className="btn btn-primary fw-bold w-100"
                          >
                            ✅ Add Event
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Calendar Grid */}
                <div className="calendar-grid p-3">
                  <div className="calendar-header">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="calendar-day-name">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="calendar-body">{renderCalendar()}</div>
                </div>
              </div>
            </div>

            {/* Event Legend */}
            <div className="card shadow mt-3">
              <div className="card-body">
                <h6 className="mb-3 fw-bold">📋 Event Types</h6>
                <div className="row">
                  {eventTypes.map((type) => (
                    <div key={type.value} className="col-md-3 col-6 mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="event-legend-dot"
                          style={{ backgroundColor: type.color }}
                        ></div>
                        <small>
                          {type.icon} {type.label}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Events List for Selected Date */}
          <div className="col-lg-4">
            <div className="card shadow sticky-top" style={{ top: "20px" }}>
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  📌 Events for{" "}
                  {formatDateDisplay(formatDateForComparison(selectedDate))}
                </h5>
              </div>
              <div className="card-body events-list">
                {selectedDateEvents.length > 0 ? (
                  <>
                    {selectedDateEvents.map((event) => {
                      const eventTypeInfo = eventTypes.find(
                        (et) => et.value === event.type
                      );
                      return (
                        <div
                          key={event.id}
                          className="event-item mb-3 p-3 rounded shadow-sm"
                          style={{
                            borderLeft: `4px solid ${eventTypeInfo.color}`,
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1 fw-bold">
                                {eventTypeInfo.icon} {event.title}
                              </h6>
                              <span
                                className="badge mb-2"
                                style={{
                                  backgroundColor: eventTypeInfo.color,
                                  color: "white",
                                }}
                              >
                                {eventTypeInfo.label}
                              </span>
                            </div>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                handleDeleteEvent(event.id, event.title)
                              }
                              title="Delete event"
                            >
                              🗑️
                            </button>
                          </div>

                          {event.time && event.time !== "All Day" && (
                            <div className="mb-2">
                              <small className="text-muted">
                                🕐 Time: <strong>{event.time}</strong>
                              </small>
                            </div>
                          )}

                          {event.location && (
                            <div className="mb-2">
                              <small className="text-muted">
                                📍 Location: <strong>{event.location}</strong>
                              </small>
                            </div>
                          )}

                          {event.description && (
                            <div className="mb-2">
                              <small className="text-muted">
                                {event.description}
                              </small>
                            </div>
                          )}

                          <div className="mt-2 pt-2 border-top">
                            <small className="text-muted">
                              Created by: <strong>{event.createdBy}</strong> (
                              {event.userType === "buyer"
                                ? "🛒 Buyer"
                                : "🌾 Seller"}
                              )
                            </small>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="text-center text-muted py-5">
                    <div style={{ fontSize: "4rem" }}>📅</div>
                    <h6 className="mt-3">No events scheduled</h6>
                    <p className="mb-0">
                      Click "Add Event" to create a new event for this date
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* All Upcoming Events */}
            <div className="card shadow mt-3">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  🔔 All Upcoming Events (
                  {events.filter((e) => new Date(e.date) >= new Date()).length})
                </h6>
              </div>
              <div className="card-body events-list-small">
                {events
                  .filter((e) => new Date(e.date) >= new Date())
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 5)
                  .map((event) => {
                    const eventTypeInfo = eventTypes.find(
                      (et) => et.value === event.type
                    );
                    return (
                      <div
                        key={event.id}
                        className="small-event-item mb-2 p-2 rounded"
                        style={{
                          borderLeft: `3px solid ${eventTypeInfo.color}`,
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="flex-grow-1">
                            <small className="fw-bold d-block">
                              {eventTypeInfo.icon} {event.title}
                            </small>
                            <small className="text-muted">
                              {formatDateDisplay(event.date)}
                            </small>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {events.filter((e) => new Date(e.date) >= new Date()).length ===
                  0 && (
                  <small className="text-muted text-center d-block">
                    No upcoming events
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
