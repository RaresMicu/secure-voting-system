import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VotingPage.css";
import CandidateBox from "../../components/CandidateBox/CandidateBox";
import { cast_vote, secure_vote } from "../../services/voteService";

function VotingPage() {
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [isVoteActive, setIsVoteActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const candidates = [
    { id: 1, name: "Candidate A", image: "party.png", party: "Party1" },
    { id: 2, name: "Candidate B", image: "party.png", party: "Party2" },
    { id: 3, name: "Candidate C", image: "party.png", party: "Party3" },
    { id: 4, name: "Candidate D", image: "party.png", party: "Party4" },
    { id: 5, name: "Candidate E", image: "party.png", party: "Party5" },
    { id: 6, name: "Candidate F", image: "party.png", party: "Party6" },
    { id: 7, name: "Candidate G", image: "party.png", party: "Party7" },
    { id: 8, name: "Candidate H", image: "party.png", party: "Party8" },
    { id: 9, name: "Candidate I", image: "party.png", party: "Party9" },
    { id: 10, name: "Candidate J", image: "party.png", party: "Party10" },
    { id: 11, name: "Candidate K", image: "party.png", party: "Party11" },
    { id: 12, name: "Candidate L", image: "party.png", party: "Party12" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 4;
  const totalPages = Math.ceil(candidates.length / candidatesPerPage);

  const handleCandidateClick = (id) => {
    setSelectedCandidateId(id);
    setIsVoteActive(true);
  };

  const handleGoBack = () => {
    setSelectedCandidateId(null);
    setIsVoteActive(false);
  };

  const handleCastVote = async () => {
    if (isVoteActive && selectedCandidateId) {
      const selectedCandidate = candidates.find(
        (candidate) => candidate.id === selectedCandidateId
      );

      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        await cast_vote(selectedCandidate.party);

        const secureResponse = await secure_vote(selectedCandidate.party);

        if (secureResponse && secureResponse.vote_id) {
          const voteData = {
            ...selectedCandidate,
            id: secureResponse.vote_id,
          };

          navigate("/printerproof", { state: { vote: voteData } });
        } else {
          console.error("Invalid secureResponse:", secureResponse);
        }
      } catch (error) {
        console.error(
          "Error securing vote:",
          error.response?.data || error.message
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const startIndex = (currentPage - 1) * candidatesPerPage;
  const currentCandidates = candidates.slice(
    startIndex,
    startIndex + candidatesPerPage
  );

  return (
    <div className="arrows-candidates-container">
      {isLoading && (
        <div className="loading-overlay">
          <p>Processing your vote...</p>
        </div>
      )}
      <div className="arrow-left" onClick={handlePreviousPage}>
        <img src={require("../../assets/leftArrow.svg").default} alt="<" />
      </div>
      <div className="voting-page">
        <div className="page-number">
          <p className="page-number-text">{currentPage}</p>
        </div>
        <p className="voting-page-text">
          Choose your candidate by clicking on them
        </p>
        <div className="voting-page-candidates">
          {currentCandidates.map((candidate) => (
            <CandidateBox
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidateId === candidate.id}
              isFaded={
                selectedCandidateId !== null &&
                selectedCandidateId !== candidate.id
              }
              onClick={() => handleCandidateClick(candidate.id)}
            />
          ))}
        </div>
        <div className="voting-page-buttons">
          <div
            className={`button gobackcolour ${
              isVoteActive ? "" : "deactivated-button"
            }`}
            onClick={isVoteActive ? handleGoBack : null}
          >
            Go back
          </div>
          <div
            className={`button castvotecolour ${
              isVoteActive ? "" : "deactivated-button"
            }`}
            onClick={isVoteActive ? handleCastVote : null}
          >
            Cast vote
          </div>
        </div>
      </div>
      <div className="arrow-right" onClick={handleNextPage}>
        <img src={require("../../assets/rightArrow.svg").default} alt=">" />
      </div>
    </div>
  );
}

export default VotingPage;
