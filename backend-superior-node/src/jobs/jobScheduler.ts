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

export const schedule_tallying_and_blockchain_storing = () => {};
//   const station_id = "B-02-001";

//   cron.schedule("0 6-23/2 25 5 *", async () => {
//     console.log("Running scheduled job: Sending results to blockchain");

//     // Trimite rezultatele catre blockchain
//     try {
//       const response = await fetch(
//         "http://localhost:3000/blockchain/sendresults",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             station_id: station_id,
//           }),
//         }
//       );
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       console.log("Results sent to blockchain:", data);
//     } catch (error) {
//       console.error("Error sending results to blockchain:", error);
//     }
//   });
// };
