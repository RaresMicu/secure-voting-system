import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();

//SA REVIN SI SA SALVEZ TX HASH INTR-UN FISIER sau DB
//DE CREAT LOG-URI PENTRU OPERATII

// Controllerul din backend va executa acest script alegand ce functie doreste sa foloseasca pentru a comunica cu blockchain-ul
async function main() {
  const contract_address = process.env.CONTRACT_ADDRESS as string;
  if (!contract_address) {
    throw new Error("Contract address not found in environment variables.");
  }
  const func = process.env.FUNC;
  const station_id = process.env.STATION_ID;
  const candidates = process.env.CANDIDATES?.split(",") || [];

  if (!func || !station_id || candidates.length !== 12) {
    throw new Error("Invalid or missing environment variables.");
  }

  switch (func) {
    case "update_votes_station":
      if (candidates.length !== 12) {
        throw new Error("Not enough arguments for update_votes_station.");
      }
      const votes = process.env.VOTES?.split(",").map(Number) || [];
      await update_votes_station(
        contract_address,
        station_id,
        candidates,
        votes
      );
      break;
    case "get_votes_station":
      if (candidates.length !== 12) {
        throw new Error("Not enough arguments for update_votes_station.");
      }
      await get_votes_station(contract_address, station_id, candidates);
      break;
    default:
      throw new Error(`Function ${func} not recognized.`);
  }
}

async function update_votes_station(
  contract_address: string,
  station_id: string,
  candidates: string[],
  votes: number[]
) {
  if (candidates.length !== 12 || votes.length !== 12) {
    throw new Error("Expected exactly 12 candidates and 12 vote counts.");
  }

  const VotingAudit = await ethers.getContractAt(
    "VotingAudit",
    contract_address
  );
  const updateTx = await VotingAudit.updateVotes(station_id, candidates, votes);
  //SA REVIN SI SA SALVEZ TX HASH INTR-UN FISIER sau DB
  await updateTx.wait();
  console.log(`Transaction Hash: ${updateTx.hash}\n`);
  //DE CREAT LOG-URI PENTRU OPERATII
  console.log(`Votes updated for ${station_id}.`);
}

async function get_votes_station(
  contract_address: string,
  station_id: string,
  candidates: string[]
) {
  if (candidates.length !== 12) {
    throw new Error("Expected exactly 12 candidates.");
  }

  const VotingAudit = await ethers.getContractAt(
    "VotingAudit",
    contract_address
  );
  const votes = await VotingAudit.getAllVotes(station_id, candidates);
  const result = votes.map((vote: any) => vote.toString());
  console.log(JSON.stringify(result));
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
