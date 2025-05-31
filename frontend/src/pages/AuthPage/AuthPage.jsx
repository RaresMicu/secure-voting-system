import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AuthPage.css";
import AuthMenu from "../../components/AuthMenu/AuthMenu.jsx";
import { auth_session, set_voter_status } from "../../services/authService.js";

function AuthPage({ setIsAuthenticated }) {
  const [stepDescription, setStepDescription] = useState("ID authentication");
  const [selectedStep, setSelectedStep] = useState("Step 1");
  const [completedSteps, setCompletedSteps] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const stepMapping = {
    "Step 1": "ID",
    "Step 2": "Fingerprint",
    "Step 3": "Default",
    "Step 4": "Key",
  };
  const descriptionMapping = {
    "Step 1": "ID authentication",
    "Step 2": "Fingerprint authentication",
    "Step 3": "Face authentication",
    "Step 4": "Activate key",
  };

  useEffect(() => {
    if (location.state?.activatedStep) {
      setSelectedStep(location.state.activatedStep);
      setStepDescription(descriptionMapping[location.state.activatedStep]);
      setCompletedSteps(location.state.completedSteps || []);
    } else {
      setSelectedStep("Step 1");
      setCompletedSteps([]);
    }
  }, [location.state]);

  const handleStartVoting = async () => {
    const activated_key_hash = "0x1234567890abcdef";

    if (completedSteps.length < 3) {
      setSelectedStep("Step 1");
      setStepDescription("ID authentication");
      setCompletedSteps([]);
      alert("Please complete all steps before starting voting.");
      console.error("Not enough steps completed to start voting.");
      return;
    }

    try {
      const response = await auth_session(activated_key_hash);

      if (response === 200) {
        setIsAuthenticated(true);
        const voterId = localStorage.getItem("voterId") || "";
        if (!voterId) {
          console.error("Voter ID not found in localStorage.");
          return;
        }
        await set_voter_status(voterId);
        localStorage.removeItem("voterId");

        navigate("/voting");
      } else {
        console.error("Authentication failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error during authentication session:", error);
    }
  };

  const handleOptionSelect = (option) => {
    if (option !== stepMapping[selectedStep] || completedSteps.includes(option))
      return;

    switch (option) {
      case "ID":
        navigate("/idcheck", { state: { completedSteps } });
        break;
      case "Fingerprint":
        navigate("/fingerprintauth", { state: { completedSteps } });
        break;
      case "Default":
        navigate("/faceauth", { state: { completedSteps } });
        break;
      default:
        setStepDescription("ID authentication");
        setSelectedStep("Step 1");
    }

    setCompletedSteps((prev) => [...prev, option]);
  };

  return (
    <div className="auth-page">
      <AuthMenu
        onOptionSelect={handleOptionSelect}
        onStartVoting={handleStartVoting}
        completedSteps={completedSteps}
        currentStep={stepMapping[selectedStep]}
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
