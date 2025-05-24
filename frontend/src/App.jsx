import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import AuthPage from "./pages/AuthPage/AuthPage.jsx";
import PrinterPage from "./pages/PrinterPage/PrinterPage.jsx";
import VotingPage from "./pages/VotingPage/VotingPage.jsx";
import FaceRecPage from "./pages/FaceRecPage/FaceRecPage.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<AuthPage setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/authentication"
          element={<AuthPage setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path="/faceauth" element={<FaceRecPage />} />
        <Route
          path="/voting"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <VotingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/printerproof"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <PrinterPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default App;
