import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();

async function main() {
  // Constante test
  const contractAddress = process.env.CONTRACT_ADDRESS as string;
  if (!contractAddress) {
    throw new Error("Contract address not found in environment variables.");
  }

  const pollingStationId = "B-02-0005";
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
    "Party13",
    "Party14",
    "Party15",
    "Party16",
    "Party17",
    "Party18",
    "Party19",
    "Party20",
  ];

  // Instantiere contract VotingAudit
  const VotingAudit = await ethers.getContractAt(
    "VotingAudit",
    contractAddress
  );

  // Initializara unei statii de votare
  await initializePollingStation(VotingAudit, pollingStationId, parties);

  // Run stress test (200 vote updates)
  await stressTest(VotingAudit, pollingStationId, parties, 200);

  // Afisarea voturilor pentru statia de votare "pollingStationId"
  await printVotes(VotingAudit, pollingStationId, parties);
}

// Functie initializare statie de votare
async function initializePollingStation(
  VotingAudit: any,
  stationId: string,
  partyList: string[]
) {
  const tx = await VotingAudit.initializeStation(stationId, partyList);
  await tx.wait();
  console.log(`Polling station ${stationId} initialized.`);
}

// Stress test: update votes 200 times
async function stressTest(
  VotingAudit: any,
  stationId: string,
  partyList: string[],
  iterations: number
) {
  for (let i = 0; i < iterations; i++) {
    const votes = partyList.map((_, index) => index * 100 + i * 100);
    const updateTx = await VotingAudit.updateVotes(stationId, partyList, votes);
    console.log(`Transaction ${i + 1} Hash: ${updateTx.hash}`);
    console.log(`Transaction ${i + 1}: Votes updated for ${stationId}.`);

    // Delay pentru a evita suprapunerea tranzactiilor ==> NonceManagare in viitor
    await delay(100);
  }
}

// Functie pentru afisarea voturilor pentru statia de votare "pollingStationId"
async function printVotes(
  VotingAudit: any,
  stationId: string,
  partyList: string[]
) {
  const result = await VotingAudit.getAllVotes(stationId, partyList);
  const formattedVotes = result.map((v: any) => v.toString());
  console.log("Votes:", formattedVotes);
}

// functie delay
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
