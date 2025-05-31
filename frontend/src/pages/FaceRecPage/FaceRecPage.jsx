import "./FaceRecPage.css";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { face_auth } from "../../services/authService.js";

const FaceRecPage = () => {
  const [reference, setReference] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call the face_auth function from authService
      const queryId = localStorage.getItem("voterId") || "";
      const data = await face_auth(reference, queryId);
      const updatedSteps = [...(location.state?.completedSteps || [])];

      if (data["distance"] < 0.6) {
        if (!updatedSteps.includes("Default")) {
          updatedSteps.push("Default");
        }
        navigate("/", {
          state: { completedSteps: updatedSteps, activatedStep: "Step 4" },
        });
      } else {
        navigate("/", { state: { activatedStep: "" } });
      }
    } catch (err) {
      console.error("Error during face authentication:", err);
      alert("Face authentication failed. Please try again.");
    }
  };

  return (
    <div className="face-auth-container">
      <div className="face-container">
        <div className="face-title">Face authentication</div>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="upload-container">
            <div>
              <label className="custom-file-upload" htmlFor="referenceInput">
                Upload Voter's Image
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

          <button type="submit">Compare Faces</button>
        </form>
      </div>
    </div>
  );
};

export default FaceRecPage;
