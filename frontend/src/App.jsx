import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import AuthPage from "./pages/AuthPage/AuthPage.jsx";
import PrinterPage from "./pages/PrinterPage/PrinterPage.jsx";
import VotingPage from "./pages/VotingPage/VotingPage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/authentication" element={<AuthPage />} />
        <Route path="/voting" element={<VotingPage />} />
        <Route path="/printerproof" element={<PrinterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
