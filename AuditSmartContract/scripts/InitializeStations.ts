import * as dotenv from "dotenv";
import { ethers } from "hardhat";
import { logTask } from "../utilities/logger";

dotenv.config();

async function main() {
  logTask("Initialize Stations", "Started");
  const contract_address = process.env.CONTRACT_ADDRESS as string;
  if (!contract_address) {
    logTask("Initialize Stations", "Failed", {
      message: "Contract address not found in environment variables.",
    });
    throw new Error("Contract address not found in environment variables.");
  }

  const stations = [
    "B-02-0000",
    "B-02-0001",
    "B-02-0002",
    "B-02-0003",
    "B-02-0004",
    "B-02-0005",
  ];

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

  // Instantiere contract VotingAudit
  const VotingAudit = await ethers.getContractAt(
    "VotingAudit",
    contract_address
  );

  for (const station of stations) {
    // Initializara unei statii de votare
    const tx = await VotingAudit.initializeStation(station, parties);
    logTask("Initialize Station", "Completed", {
      station,
      parties,
    });
    console.log(`Station ${station} initialized.`);
    console.log(`Transaction Hash: ${tx.hash}`);
    await delay(200);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  logTask("Initialize Stations", "Failed", {
    message: error.message,
  });
  console.error(error);
  process.exitCode = 1;
});
