import React from "react";
import { useLocation } from "react-router-dom";
import "./PrinterPage.css";
import PrintedVoteBox from "../../components/PrintedVoteBox/PrintedVoteBox";

function PrinterPage() {
  const location = useLocation();
  const { vote } = location.state || {};

  const generateRandomId = () => Math.floor(Math.random() * 1000000);

  return (
    <div className="printer-page">
      {vote ? (
        <PrintedVoteBox
          vote={{
            candidate: vote.name,
            party: vote.party,
            id: generateRandomId(),
          }}
        />
      ) : (
        <p>No vote data available</p>
      )}
    </div>
  );
}

export default PrinterPage;
