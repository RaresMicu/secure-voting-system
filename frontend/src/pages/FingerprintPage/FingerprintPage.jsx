import "./FingerprintPage.css";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fingerprint_auth } from "../../services/authService.js";

const FingerprintPage = () => {
  const [reference, setReference] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call the fingerprint_auth function from authService
      const queryId = localStorage.getItem("voterId") || "";
      const data = await fingerprint_auth(reference, queryId);
      const updatedSteps = [...(location.state?.completedSteps || [])];

      if (data.match) {
        if (!updatedSteps.includes("Fingerprint")) {
          updatedSteps.push("Fingerprint");
        }
        navigate("/", {
          state: { completedSteps: updatedSteps, activatedStep: "Step 3" },
        });
      } else {
        navigate("/", { state: { activatedStep: "" } });
      }
    } catch (err) {
      console.error("Error during finger authentication:", err);
      alert("Finger authentication failed. Please try again.");
    }
  };

  return (
    <div className="finger-auth-container">
      <div className="finger-container">
        <div className="face-title">Fingerprint authentication</div>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="upload-container">
            <div>
              <label className="custom-file-upload" htmlFor="referenceInput">
                Upload Voter's Fingerprint
              </label>
              <br />
              <input
                id="referenceInput"
                type="file"
                accept="image/*"
                required
                onChange={(e) => setReference(e.target.files[0])}
              />
            </div>
            <p className="file-text">
              File: {reference ? reference.name : "No file selected"}
            </p>
          </div>

          <button type="submit">Compare Fingerprints</button>
        </form>
      </div>
    </div>
  );
};

export default FingerprintPage;
