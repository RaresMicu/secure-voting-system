import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";
import AuthMenu from "../../components/AuthMenu/AuthMenu.jsx";

function AuthPage() {
  const [stepDescription, setStepDescription] = useState("ID authentication");
  const [selectedStep, setSelectedStep] = useState("Step 1");

  const navigate = useNavigate();
  const handleStartVoting = () => {
    navigate("/voting");
  };

  const handleOptionSelect = (option) => {
    switch (option) {
      case "ID":
        setStepDescription("ID authentication");
        setSelectedStep("Step 1");
        break;
      case "Key":
        setStepDescription("Activate key");
        setSelectedStep("Step 4");
        break;
      case "Fingerprint":
        setStepDescription("Fingerprint authentication");
        setSelectedStep("Step 2");
        break;
      case "Default":
        setStepDescription("Face authentication");
        setSelectedStep("Step 3");
        break;
      default:
        setStepDescription("ID authentication");
        setSelectedStep("Step 1");
    }
  };

  return (
    <div className="auth-page">
      <AuthMenu
        onOptionSelect={handleOptionSelect}
        onStartVoting={handleStartVoting}
      ></AuthMenu>
      <div className="steps-text-container">
        <div className="step-card">
          <p className="step-text">{selectedStep}</p>
        </div>
        <p className="step-description">{stepDescription}</p>
      </div>
    </div>
  );
}

export default AuthPage;
