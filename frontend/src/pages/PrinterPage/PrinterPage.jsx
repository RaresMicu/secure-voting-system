import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PrinterPage.css";
import PrintedVoteBox from "../../components/PrintedVoteBox/PrintedVoteBox";

function PrinterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { vote } = location.state || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/authentication");
    }, 7000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="printer-page">
      {vote ? (
        <PrintedVoteBox
          vote={{
            candidate: vote.name,
            party: vote.party,
            id: vote.id,
          }}
        />
      ) : (
        <p>No vote data available</p>
      )}
    </div>
  );
}

export default PrinterPage;
