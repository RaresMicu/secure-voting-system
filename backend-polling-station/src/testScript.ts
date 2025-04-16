const station_ids = ["B-02-001", "B-02-002", "B-02-003", "B-02-004"];
const superior_station_id = "B-02-000";
const superior_station_id_array = [superior_station_id];
const parties = [
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
];
const url_m_const1 = "http://localhost:3000/pollingmachine/";
const url_bc_const1 = "http://localhost:3000/blockchain/";
const adding_url = url_m_const1 + "castedvotes";
const sending_url = url_bc_const1 + "sendresults";

const url_bc_const2 = "http://localhost:2999/blockchain/";
const get_url = url_bc_const2 + "getresults";
const sending_url2 = url_bc_const2 + "sendresults";

//Fetching the votes from the blockchain
// (async () => {
//   const result = await fetch(get_url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       station_ids: station_ids,
//     }),
//   });
//   if (!result.ok) {
//     console.error(`Failed to fetch votes: ${result.statusText}`);
//   } else {
//     const data = await result.json();
//     console.log(`Votes fetched successfully:`, data);
//   }
// })();

//Adding random votes to each polling station
// (async () => {
//   for (const party of parties) {
//     const result = await fetch(adding_url, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         candidate: party,
//       }),
//     });

//     if (!result.ok) {
//       console.error(`Failed to add vote for ${party}: ${result.statusText}`);
//     }
//   }
// })();

// Sending the votes to the blockchain from inferior node
// (async () => {
//   for (const station of station_ids) {
//     const result = await fetch(sending_url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         station_id: station,
//       }),
//     });
//     if (!result.ok) {
//       console.error(
//         `Failed to send votes for ${station}: ${result.statusText}`
//       );
//     } else {
//       console.log(`Votes sent successfully for ${station}`);
//     }
//   }
// })();

// Sending the votes to the blockchain from superior node
// (async () => {
//   const result = await fetch(sending_url2, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       station_id: superior_station_id,
//     }),
//   });
//   if (!result.ok) {
//     console.error(
//       `Failed to send votes for ${superior_station_id}: ${result.statusText}`
//     );
//   } else {
//     console.log(`Votes sent successfully for ${superior_station_id}`);
//   }
// })();

//Fetching the votes from the blockchain for the superior node just for test for its id
// (async () => {
//   const result = await fetch(get_url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       station_ids: superior_station_id_array,
//     }),
//   });
//   if (!result.ok) {
//     console.error(`Failed to fetch votes: ${result.statusText}`);
//   } else {
//     const data = await result.json();
//     console.log(`Votes fetched successfully:`, data);
//   }
// })();
