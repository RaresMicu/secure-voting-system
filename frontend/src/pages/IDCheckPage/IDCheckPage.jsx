import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./IDCheckPage.css";
import { id_auth } from "../../services/authService.js";

const IDCheckPage = () => {
  const [queryId, setQueryId] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call the id_auth function from authService
      const data = await id_auth(queryId);
      const updatedSteps = [...(location.state?.completedSteps || [])];

      console.log("ID Check Response:", data);

      if (data.result) {
        if (!updatedSteps.includes("ID")) {
          updatedSteps.push("ID");
        }
        localStorage.setItem("voterId", queryId);
        navigate("/", {
          state: { completedSteps: updatedSteps, activatedStep: "Step 2" },
        });
      } else {
        navigate("/", { state: { activatedStep: "" } });
      }
    } catch (err) {
      console.error("Error during ID authentication:", err);
      alert("ID authentication failed. Please try again.");
    }
  };

  return (
    <div className="id-auth-container">
      <div className="id-container">
        <div className="face-title">ID authentication</div>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="upload-container">
            <div className="input-container">
              <label className="label-text" htmlFor="queryIdInput">
                Voter's ID:
              </label>
              <input
                id="queryIdInput"
                type="text"
                placeholder="Enter ID"
                value={queryId}
                required
                onChange={(e) => setQueryId(e.target.value)}
              />
            </div>
          </div>

          <button type="submit">Check ID</button>
        </form>
      </div>
    </div>
  );
};

export default IDCheckPage;
