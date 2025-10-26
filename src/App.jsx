import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./component/Home";
import Login from "./component/Login";
import Signup from "./component/Signup";
import BuyerDashboard from "./component/BuyerDashboard";
import SellerDashboard from "./component/SellerDashboard";
import EquipmentRenting from "./component/EquipmentRenting.jsx";
import Chat from "./component/Chat.jsx";
import Calendar from "./component/Calendar";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/equipment-renting" element={<EquipmentRenting />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
