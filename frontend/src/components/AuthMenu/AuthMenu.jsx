import React from "react";
import "./AuthMenu.css";
import AuthButton from "../AuthButton/AuthButton";

function AuthMenu({
  onOptionSelect,
  onStartVoting,
  completedSteps,
  currentStep,
}) {
  return (
    <div className="auth-menu">
      <div className="circle-div">
        <div
          className="button-container top"
          onClick={() => onOptionSelect("ID")}
        >
          <AuthButton
            iconName="ID"
            disabled={completedSteps.includes("ID")}
            currentStep={currentStep === "ID"}
          />
        </div>
        <div
          className={`button-container center ${currentStep === "Key" ? "" : "not-current"}`}
          onClick={onStartVoting}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="163"
            height="87"
            viewBox="0 0 163 87"
            fill="none"
            onClick={() => onOptionSelect("Key")}
          >
            <path
              className="key"
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M1.36351e-07 43.5032C-0.000765989 33.8339 3.22701 24.44 9.17341 16.8055C15.1198 9.17099 23.4458 3.73108 32.8362 1.34513C42.2265 -1.04081 52.1459 -0.236754 61.0272 3.63027C69.9085 7.49729 77.2455 14.2068 81.8791 22.699H149.733C157.056 22.699 163 28.63 163 35.938V54.8509C163 56.3557 162.401 57.7989 161.335 58.8629C160.268 59.927 158.822 60.5248 157.314 60.5248H140.256V73.7638C140.256 75.2686 139.657 76.7118 138.59 77.7758C137.524 78.8399 136.078 79.4377 134.57 79.4377H115.616C114.108 79.4377 112.662 78.8399 111.596 77.7758C110.529 76.7118 109.93 75.2686 109.93 73.7638V60.5248H83.7214C79.7868 69.7534 72.7778 77.3423 63.8805 82.0072C54.9833 86.672 44.7442 88.1263 34.8959 86.124C25.0476 84.1218 16.1949 78.7858 9.83601 71.0192C3.47709 63.2526 0.00242092 53.5323 1.36351e-07 43.5032ZM43.593 28.3728C39.5716 28.3728 35.7149 29.9669 32.8713 32.8044C30.0277 35.6419 28.4302 39.4903 28.4302 43.5032C28.4302 47.516 30.0277 51.3644 32.8713 54.2019C35.7149 57.0394 39.5716 58.6335 43.593 58.6335C47.6144 58.6335 51.4712 57.0394 54.3147 54.2019C57.1583 51.3644 58.7558 47.516 58.7558 43.5032C58.7558 39.4903 57.1583 35.6419 54.3147 32.8044C51.4712 29.9669 47.6144 28.3728 43.593 28.3728Z"
            />
          </svg>
        </div>
        <div
          className="button-container left"
          onClick={() => onOptionSelect("Fingerprint")}
        >
          <AuthButton
            iconName="Fingerprint"
            disabled={completedSteps.includes("Fingerprint")}
            currentStep={currentStep === "Fingerprint"}
          />
        </div>
        <div
          className="button-container right"
          onClick={() => onOptionSelect("Default")}
        >
          <AuthButton
            iconName="default"
            disabled={completedSteps.includes("Default")}
            currentStep={currentStep === "Default"}
          />
        </div>
      </div>
    </div>
  );
}

export default AuthMenu;
