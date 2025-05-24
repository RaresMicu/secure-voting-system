import cron from "node-cron";

export const schedule_initialization_DB = () => {
  cron.schedule("0 7 25 5 *", async () => {
    console.log("Running scheduled job: Initializing database and candidates");

    // Sterge tot ce era in baza de date inainte
    try {
      const response = await fetch(
        "http://localhost:2999/pollingmachine/resetdb",
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Database reset:", data);
    } catch (error) {
      console.error("Error resetting database:", error);
    }

    // Initializeaza baza de date cu candidati
    try {
      const response = await fetch(
        "http://localhost:2999/pollingmachine/initializecandidates",
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Database initialized:", data);
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  });
};

export const schedule_tallying_and_blockchain_storing = () => {
  const inferior_station_ids = ["B-02-001", "B-02-002", "B-02-003", "B-02-004"];
  const station_id_superior = "B-02-000";

  // cron.schedule("59 8-23/2 25 5 *", async () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log(
      "Running scheduled job: Tallying votes from inferior nodes and storing in blockchain"
    );

    try {
      const response_getresults = await fetch(
        "http://localhost:2999/blockchain/getresults",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            station_ids: inferior_station_ids,
          }),
        }
      );
      if (!response_getresults.ok) {
        throw new Error(`HTTP error! status: ${response_getresults.status}`);
      }
      const data = await response_getresults.json();
      console.log("Votes tallied and stored in blockchain:", data);

      // Trimitere rezultate catre blockchain
      const response_sendresults = await fetch(
        "http://localhost:2999/blockchain/sendresults",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            station_id: station_id_superior,
          }),
        }
      );
      if (!response_sendresults.ok) {
        throw new Error(`HTTP error! status: ${response_sendresults.status}`);
      }
      const data_sendresults = await response_sendresults.json();
      console.log("Results sent to blockchain:", data_sendresults);
    } catch (error) {
      console.error("Error tallying votes and storing in blockchain:", error);
    }
  });
};
