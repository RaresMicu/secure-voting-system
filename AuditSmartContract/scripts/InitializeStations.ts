import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();
// DE ADAUGAT AUDIT, DE MEMORAT TX HASH-URI INTR-UN FISIER SAU DB + operatiile

async function main() {
  const contract_address = process.env.CONTRACT_ADDRESS as string;
  if (!contract_address) {
    throw new Error("Contract address not found in environment variables.");
  }

  const stations = [
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
    await tx.wait();
    console.log(`Station ${station} initialized.`);
    console.log(`Transaction Hash: ${tx.hash}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
