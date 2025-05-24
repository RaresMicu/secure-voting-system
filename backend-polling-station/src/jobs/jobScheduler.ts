import cron from "node-cron";
import { logTask } from "../utilities/logger";

export const schedule_initialization_DB = () => {
  cron.schedule("0 7 25 5 *", async () => {
    logTask("Initialization DB", "Started", {
      message: "Initializing database and candidates",
    });
    console.log("Running scheduled job: Initializing database and candidates");

    // Sterge tot ce era in baza de date inainte
    try {
      const response = await fetch(
        "http://localhost:3000/pollingmachine/resetdb",
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        logTask("Initialization DB", "Error", {
          message: `Failed to reset database: ${response.statusText}`,
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      logTask("Initialization DB", "Success", {
        message: "Database reset successfully",
        data,
      });
      console.log("Database reset:", data);
    } catch (error) {
      logTask("Initialization DB", "Error", {
        message: `Failed to reset database: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      console.error("Error resetting database:", error);
    }

    // Initializeaza baza de date cu candidati

    try {
      const response = await fetch(
        "http://localhost:3000/pollingmachine/initializecandidates",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidates: [
              "Party1",
              "Party2",
              "Party3",
              "Party4",
              "Party5",
              "Party6",
              "Party7",
              "Party8",
              "Party9",
              "Party10",
              "Party11",
              "Party12",
            ],
          }),
        }
      );
      if (!response.ok) {
        logTask("Initialization DB", "Error", {
          message: `Failed to initialize candidates: ${response.statusText}`,
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      logTask("Initialization DB", "Success", {
        message: "Database initialized with candidates successfully",
        data,
      });
      console.log("Database initialized:", data);
    } catch (error) {
      logTask("Initialization DB", "Error", {
        message: `Failed to initialize candidates: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      console.error("Error initializing database:", error);
    }
  });
};

export const schedule_result_sending = () => {
  const station_id = "B-02-001";

  // cron.schedule("0 6-23/2 25 5 *", async () => {
  cron.schedule("*/1 * * * *", async () => {
    logTask("Send Results to Blockchain", "Started", {
      message: "Sending results to blockchain",
    });
    console.log("Running scheduled job: Sending results to blockchain");

    // Trimite rezultatele catre blockchain
    try {
      const response = await fetch(
        "http://localhost:3000/blockchain/sendresults",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            station_id: station_id,
          }),
        }
      );
      if (!response.ok) {
        logTask("Send Results to Blockchain", "Error", {
          message: `Failed to send results: ${response.statusText}`,
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      logTask("Send Results to Blockchain", "Success", {
        message: "Results sent to blockchain successfully",
        data,
      });
      console.log("Results sent to blockchain:", data);
    } catch (error) {
      logTask("Send Results to Blockchain", "Error", {
        message: `Failed to send results: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      console.error("Error sending results to blockchain:", error);
    }
  });
};
