import * as dotenv from "dotenv";
import { ethers } from "hardhat";
import { logTask } from "../utilities/logger";

dotenv.config();

// Controllerul din backend va executa acest script alegand ce functie doreste sa foloseasca pentru a comunica cu blockchain-ul
async function main() {
  const contract_address = process.env.CONTRACT_ADDRESS as string;
  if (!contract_address) {
    logTask("Smart Contract", "Failed", {
      message: "Contract address not found in environment variables.",
    });
    throw new Error("Contract address not found in environment variables.");
  }
  const func = process.env.FUNC;
  const station_id = process.env.STATION_ID;
  const candidates = process.env.CANDIDATES?.split(",") || [];

  if (!func || !station_id || candidates.length !== 12) {
    logTask("Smart Contract", "Failed", {
      message: "Invalid or missing environment variables.",
    });
    throw new Error("Invalid or missing environment variables.");
  }

  switch (func) {
    case "update_votes_station":
      logTask("Update Votes Station", "Started");
      if (candidates.length !== 12) {
        logTask("Update Votes Station", "Failed", {
          message: "Not enough candidates provided.",
        });
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
      logTask("Get Votes Station", "Started");
      if (candidates.length !== 12) {
        logTask("Get Votes Station", "Failed", {
          message: "Not enough candidates provided.",
        });
        throw new Error("Not enough arguments for update_votes_station.");
      }
      await get_votes_station(contract_address, station_id, candidates);
      break;
    default:
      logTask("Smart Contract", "Failed", {
        message: `Function ${func} not recognized.`,
      });
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
    logTask("Update Votes Station", "Failed", {
      message: "Expected exactly 12 candidates and 12 vote counts.",
    });
    throw new Error("Expected exactly 12 candidates and 12 vote counts.");
  }

  const VotingAudit = await ethers.getContractAt(
    "VotingAudit",
    contract_address
  );
  const updateTx = await VotingAudit.updateVotes(station_id, candidates, votes);

  await updateTx.wait();
  logTask("Update Votes Station", "Success", {
    transactionHash: updateTx.hash,
    message: `Votes updated successfully for station ${station_id}.`,
  });
  console.log(`Transaction Hash: ${updateTx.hash}\n`);
  console.log(`Votes updated for ${station_id}.`);
}

async function get_votes_station(
  contract_address: string,
  station_id: string,
  candidates: string[]
) {
  if (candidates.length !== 12) {
    logTask("Get Votes Station", "Failed", {
      message: "Expected exactly 12 candidates.",
    });
    throw new Error("Expected exactly 12 candidates.");
  }

  const VotingAudit = await ethers.getContractAt(
    "VotingAudit",
    contract_address
  );
  const votes = await VotingAudit.getAllVotes(station_id, candidates);
  const result = votes.map((vote: any) => vote.toString());
  logTask("Get Votes Station", "Success", {
    message: `Votes retrieved successfully for station ${station_id}.`,
  });
  console.log(JSON.stringify(result));
}

main().catch((err) => {
  logTask("Smart Contract", "Failed", {
    message: `Error executing script: ${err.message}`,
  });
  console.error("Script error:", err);
  process.exit(1);
});
