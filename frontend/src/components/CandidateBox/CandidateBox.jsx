import React from "react";
import "./CandidateBox.css";

function CandidateBox({ candidate, isSelected, isFaded, onClick }) {
  return (
    <div
      className={`candidate-box ${isSelected ? "selected" : ""} ${
        isFaded ? "faded" : ""
      }`}
      onClick={onClick}
    >
      <img
        src={require(`../../assets/${candidate.image}`)}
        alt={candidate.name}
        className="candidate-image"
      />
      <div className="line-between"></div>
      <div className="candidate-details">
        <h2 className="candidate-name">{candidate.name}</h2>
        <p className="candidate-party">{candidate.party}</p>
      </div>
    </div>
  );
}

export default CandidateBox;
