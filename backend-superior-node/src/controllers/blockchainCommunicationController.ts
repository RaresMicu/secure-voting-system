import path from "path";
import { prisma } from "../app";
import { exec } from "child_process";
import { Request, Response } from "express";
import {
  sanitizeEnvString,
  sanitizeEnvList,
} from "../../../shared-utils/sanitize";

export const send_results = async (req: Request, res: Response) => {
  const { station_id } = req.body;
  if (!station_id) {
    return res.status(400).json({ error: "Missing station_id." });
  }

  const votesData = await prisma.voteResults.findMany({
    select: {
      candidate: true,
      votes: true,
    },
  });
  if (!votesData) {
    return res.status(404).json({ error: "No votes data found." });
  }

  let candidates: string[];
  let votes: number[];

  try {
    const rawCandidates = votesData.map((data) => data.candidate);
    const rawVotes = votesData.map((data) => data.votes);

    candidates = sanitizeEnvList(
      "CANDIDATES",
      rawCandidates.join(","),
      12
    ) as string[];
    votes = sanitizeEnvList("VOTES", rawVotes.join(","), 12, {
      type: "number",
    }) as number[];

    sanitizeEnvString("STATION_ID", station_id);
  } catch (err: any) {
    return res
      .status(400)
      .json({ error: `Sanitization failed: ${err.message}` });
  }

  const scriptPath = path.resolve(
    __dirname,
    "../../../AuditSmartContract/scripts/StationsTx.ts"
  );

  const command = `npx hardhat run  ${scriptPath} --network private `;

  const env = {
    ...process.env,
    FUNC: "update_votes_station",
    STATION_ID: station_id,
    CANDIDATES: candidates.join(","),
    VOTES: votes.join(","),
  };

  exec(
    command,
    { cwd: path.resolve(__dirname, "../../../AuditSmartContract"), env },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: "Script execution failed." });
      }

      res
        .status(200)
        .json({ message: "Script executed successfully.", output: stdout });
    }
  );
};
///////////////////////////////////////////////////////

export const get_results = async (req: Request, res: Response) => {
  const { station_ids } = req.body;
  if (!station_ids || !Array.isArray(station_ids)) {
    return res
      .status(400)
      .json({ error: "Missing station_ids or bat format." });
  }

  const votesData = await prisma.voteResults.findMany({
    select: {
      candidate: true,
    },
  });
  if (!votesData) {
    return res.status(404).json({ error: "No candidates found." });
  }

  let candidates: string[];
  let station_ids_sanitized: string[];
  const tallied_votes: { [candidate: string]: number } = {};

  try {
    const rawCandidates = votesData.map((data) => data.candidate);
    const rawStationIds = station_ids.map((data) => data);

    candidates = sanitizeEnvList(
      "CANDIDATES",
      rawCandidates.join(","),
      12
    ) as string[];
    station_ids_sanitized = sanitizeEnvList(
      "STATION_IDS",
      rawStationIds.join(","),
      rawStationIds.length
    ) as string[];

    candidates.forEach((candidate) => {
      tallied_votes[candidate] = 0;
    });
  } catch (err: any) {
    return res
      .status(400)
      .json({ error: `Sanitization failed: ${err.message}` });
  }

  const scriptPath = path.resolve(
    __dirname,
    "../../../AuditSmartContract/scripts/StationsTx.ts"
  );
  const command = `npx hardhat run  ${scriptPath} --network private `;

  // Luarea datelor din blockchain pentru fiecare station_id si insumarea voturilor
  for (const station_id of station_ids_sanitized) {
    const env = {
      ...process.env,
      FUNC: "get_votes_station",
      STATION_ID: station_id,
      CANDIDATES: candidates.join(","),
    };

    try {
      const result = await new Promise<{ stdout: string; stderr: string }>(
        (resolve, reject) => {
          exec(
            command,
            {
              cwd: path.resolve(__dirname, "../../../AuditSmartContract"),
              env,
            },
            (error, stdout, stderr) => {
              if (error) {
                console.error(
                  `Error executing script for station ${station_id}: ${error.message}`
                );
                console.error(`stderr: ${stderr}`);
                return reject(
                  new Error(`Failed to fetch votes for station ${station_id}`)
                );
              }
              resolve({ stdout, stderr });
            }
          );
        }
      );

      // Extragerea voturilor din stdout
      const votes = JSON.parse(result.stdout);

      console.log(`Votes for station ${station_id}:`, votes);

      votes.forEach((vote: string, index: number) => {
        tallied_votes[candidates[index]] += parseInt(vote, 10);
      });
    } catch (err) {
      console.error(
        `Error processing station ${station_id}: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      continue;
    }
  }
  
  console.log("Tallied votes:", tallied_votes);

  //Adaugarea voturilor in DB
  try {
    for (const candidate of candidates) {
      await prisma.voteResults.update({
        where: {
          candidate: candidate,
        },
        data: {
          votes: tallied_votes[candidate],
        },
      });
    }
    return res.status(200).json({ message: "Votes updated successfully." });
  } catch (error) {
    console.error("Error updating votes:", error);
    return res
      .status(500)
      .json({ error: "Failed to update votes in the database." });
  }
};
