import React from "react";
import "./PrintedVoteBox.css";

function PrintedVoteBox({ vote }) {
  return (
    <div className="printed-vote-box">
      <img
        src={require("../../assets/ConfirmSign.svg").default}
        alt="OK"
        className="printed-vote-box-image"
      />
      <div className="printed-vote-text-container">
        <p className="text-confirmation">Your vote has been casted!</p>
        <div className="text-details-container">
          <p className="text-details">{vote.candidate}</p>
          <p className="text-details">{vote.party}</p>
        </div>
        <p className="vote-id-text">Vote ID:</p>
        <p className="text-confirmation id-styling">#{vote.id}</p>
      </div>
    </div>
  );
}

export default PrintedVoteBox;
