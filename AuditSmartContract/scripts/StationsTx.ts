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
  const [func, ...args] = process.argv.slice(2);
  const station_id = args[0];
  //Presupun ca sunt 12 candidati
  const parties = args.slice(1, 13);

  switch (func) {
    case "update_votes_station":
      if (args.length < 25) {
        throw new Error("Not enough arguments for update_votes_station.");
      }
      const votes = args.slice(13, 25).map(Number);
      await update_votes_station(contract_address, station_id, parties, votes);
      break;
    case "get_votes_station":
      if (args.length < 13) {
        throw new Error("Not enough arguments for update_votes_station.");
      }
      await get_votes_station(contract_address, station_id, parties);
      break;
    default:
      throw new Error(`Function ${func} not recognized.`);
  }
}

async function update_votes_station(
  contract_address: string,
  station_id: string,
  parties: string[],
  votes: number[]
) {
  if (parties.length !== 12 || votes.length !== 12) {
    throw new Error("Expected exactly 12 parties and 12 vote counts.");
  }

  const VotingAudit = await ethers.getContractAt(
    "VotingAudit",
    contract_address
  );
  const updateTx = await VotingAudit.updateVotes(station_id, parties, votes);
  //SA REVIN SI SA SALVEZ TX HASH INTR-UN FISIER sau DB
  await updateTx.wait();
  console.log(`Transaction Hash: ${updateTx.hash}`);
  //DE CREAT LOG-URI PENTRU OPERATII
  console.log(`Votes updated for ${station_id}.`);
}

async function get_votes_station(
  contract_address: string,
  station_id: string,
  parties: string[]
) {
  if (parties.length !== 12) {
    throw new Error("Expected exactly 12 parties.");
  }

  const VotingAudit = await ethers.getContractAt(
    "VotingAudit",
    contract_address
  );
  const votes = await VotingAudit.getAllVotes(station_id, parties);
  const result = votes.map((vote: any) => vote.toString());
  console.log(JSON.stringify(result));
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
