import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Chat.css";

const Chat = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
      toast.error("Please login to access chat", {
        icon: "🚫",
        duration: 3000,
      });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }
    setCurrentUser(user);

    // Load messages from localStorage
    loadMessages();

    // Load online users
    loadOnlineUsers();

    // Mark user as online
    markUserOnline(user);

    // Poll for new messages every 2 seconds
    const messageInterval = setInterval(() => {
      loadMessages();
      loadOnlineUsers();
    }, 2000);

    // Cleanup on unmount
    return () => {
      clearInterval(messageInterval);
      markUserOffline(user);
    };
  }, [navigate]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    try {
      const storedMessages = JSON.parse(
        localStorage.getItem("chatMessages") || "[]"
      );
      setMessages(storedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const loadOnlineUsers = () => {
    try {
      const users = JSON.parse(localStorage.getItem("onlineUsers") || "[]");
      // Filter out users that haven't been active in the last 5 minutes
      const now = Date.now();
      const activeUsers = users.filter(
        (user) => now - user.lastActive < 5 * 60 * 1000
      );
      localStorage.setItem("onlineUsers", JSON.stringify(activeUsers));
      setOnlineUsers(activeUsers);
    } catch (error) {
      console.error("Error loading online users:", error);
    }
  };

  const markUserOnline = (user) => {
    try {
      const users = JSON.parse(localStorage.getItem("onlineUsers") || "[]");
      const existingUserIndex = users.findIndex((u) => u.email === user.email);

      if (existingUserIndex >= 0) {
        users[existingUserIndex].lastActive = Date.now();
      } else {
        users.push({
          email: user.email,
          fullName: user.fullName,
          userType: user.userType,
          lastActive: Date.now(),
        });
      }

      localStorage.setItem("onlineUsers", JSON.stringify(users));
    } catch (error) {
      console.error("Error marking user online:", error);
    }
  };

  const markUserOffline = (user) => {
    try {
      const users = JSON.parse(localStorage.getItem("onlineUsers") || "[]");
      const filteredUsers = users.filter((u) => u.email !== user.email);
      localStorage.setItem("onlineUsers", JSON.stringify(filteredUsers));
    } catch (error) {
      console.error("Error marking user offline:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      toast.error("Please enter a message", {
        icon: "❌",
        duration: 2000,
      });
      return;
    }

    try {
      const messageData = {
        id: Date.now(),
        text: newMessage.trim(),
        sender: currentUser.fullName,
        senderEmail: currentUser.email,
        senderType: currentUser.userType,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, messageData];
      localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
      setNewMessage("");

      toast.success("Message sent!", {
        icon: "✅",
        duration: 1500,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message", {
        icon: "❌",
      });
    }
  };

  const handleDeleteMessage = (messageId) => {
    try {
      const updatedMessages = messages.filter((msg) => msg.id !== messageId);
      localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
      setMessages(updatedMessages);

      toast.success("Message deleted", {
        icon: "🗑️",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message", {
        icon: "❌",
      });
    }
  };

  const handleClearChat = () => {
    toast(
      (t) => (
        <div>
          <p className="mb-3">
            <strong>Clear All Messages?</strong>
            <br />
            <small className="text-muted">
              This will delete all chat messages for everyone.
            </small>
          </p>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                localStorage.setItem("chatMessages", "[]");
                setMessages([]);
                toast.dismiss(t.id);
                toast.success("Chat cleared", {
                  icon: "✅",
                });
              }}
            >
              Clear
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
        icon: "⚠️",
        duration: 5000,
      }
    );
  };

  const handleBackToDashboard = () => {
    if (currentUser?.userType === "buyer") {
      navigate("/buyer-dashboard");
    } else {
      navigate("/seller-dashboard");
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  return (
    <div className="chat-page">
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
      <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
        <div className="container-fluid px-4">
          <a className="navbar-brand fw-bold fs-4" href="#">
            💬 AgroConnect - Community Chat
          </a>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white d-none d-md-inline">
              Welcome, <strong>{currentUser?.fullName}</strong> (
              {currentUser?.userType === "buyer" ? "🛒 Buyer" : "🌾 Seller"})
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

      <div className="container-fluid chat-container">
        <div className="row h-100">
          {/* Online Users Sidebar */}
          <div className="col-md-3 col-lg-2 online-users-sidebar">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">👥 Online Users ({onlineUsers.length})</h6>
              </div>
              <div className="card-body p-2">
                {onlineUsers.length > 0 ? (
                  <ul className="list-unstyled mb-0">
                    {onlineUsers.map((user, index) => (
                      <li
                        key={index}
                        className="online-user-item p-2 mb-2 rounded"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <div className="online-indicator"></div>
                          <div className="flex-grow-1">
                            <div className="user-name">
                              {user.fullName}
                              {user.email === currentUser?.email && " (You)"}
                            </div>
                            <small className="user-type">
                              {user.userType === "buyer"
                                ? "🛒 Buyer"
                                : "🌾 Seller"}
                            </small>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted text-center mt-3">No users online</p>
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-md-9 col-lg-10 chat-main">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">💬 Community Chat</h5>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleClearChat}
                >
                  🗑️ Clear Chat
                </button>
              </div>

              {/* Messages Area */}
              <div className="card-body chat-messages-area">
                {messages.length > 0 ? (
                  <>
                    {messages.map((msg, index) => {
                      const isOwnMessage =
                        msg.senderEmail === currentUser?.email;
                      const showDateDivider =
                        index === 0 ||
                        formatDate(messages[index - 1].timestamp) !==
                          formatDate(msg.timestamp);

                      return (
                        <React.Fragment key={msg.id}>
                          {showDateDivider && (
                            <div className="date-divider">
                              <span>{formatDate(msg.timestamp)}</span>
                            </div>
                          )}
                          <div
                            className={`message-wrapper ${
                              isOwnMessage ? "own-message" : "other-message"
                            }`}
                          >
                            <div className="message-bubble">
                              <div className="message-header">
                                <span className="sender-name">
                                  {isOwnMessage ? "You" : msg.sender}
                                </span>
                                <span
                                  className={`badge ${
                                    msg.senderType === "buyer"
                                      ? "bg-primary"
                                      : "bg-warning text-dark"
                                  } ms-2`}
                                >
                                  {msg.senderType === "buyer"
                                    ? "🛒 Buyer"
                                    : "🌾 Seller"}
                                </span>
                              </div>
                              <div className="message-text">{msg.text}</div>
                              <div className="message-footer">
                                <span className="message-time">
                                  {formatTime(msg.timestamp)}
                                </span>
                                {isOwnMessage && (
                                  <button
                                    className="btn-delete-message"
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    title="Delete message"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="text-center text-muted mt-5">
                    <div style={{ fontSize: "4rem" }}>💬</div>
                    <h5 className="mt-3">No messages yet</h5>
                    <p>Be the first to start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="card-footer bg-light">
                <form
                  onSubmit={handleSendMessage}
                  className="message-input-form"
                >
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      maxLength={500}
                    />
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={!newMessage.trim()}
                    >
                      Send 📤
                    </button>
                  </div>
                  <small className="text-muted">
                    {newMessage.length}/500 characters
                  </small>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
