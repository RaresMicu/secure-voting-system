import path from "path";
import { prisma } from "../app";
import { exec } from "child_process";
import { Request, Response } from "express";

import { logTask } from "../utilities/logger";
import {
  sanitizeEnvString,
  sanitizeEnvList,
} from "../../../shared-utils/sanitize";
import { count, log } from "console";

export const send_results = async (req: Request, res: Response) => {
  logTask("Send Results", "Started", { station_id: req.body.station_id });

  const { station_id } = req.body;
  if (!station_id) {
    logTask("Send Results", "Failed", { error: "Missing station_id." });
    return res.status(400).json({ error: "Missing station_id." });
  }

  const votesData = await prisma.voteResults.findMany({
    select: {
      candidate: true,
      votes: true,
    },
  });
  if (!votesData) {
    logTask("Send Results", "Failed", { error: "No votes data found." });

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
    logTask("Send Results", "Sanitization Failed", { error: err.message });
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
        logTask("Send Results", "Script Execution Failed", {
          error: error.message,
          stderr,
        });
        return res.status(500).json({ error: "Script execution failed." });
      }
      logTask("Send Results", "Success", { output: stdout });
      res
        .status(200)
        .json({ message: "Script executed successfully.", output: stdout });
    }
  );
};
///////////////////////////////////////////////////////

export const get_results = async (req: Request, res: Response) => {
  logTask("Get Results", "Started", { station_ids: req.body.station_ids });

  const { station_ids } = req.body;
  if (!station_ids || !Array.isArray(station_ids)) {
    logTask("Get Results", "Failed", {
      error: "Missing station_ids or bad format.",
    });
    return res
      .status(400)
      .json({ error: "Missing station_ids or bad format." });
  }

  const votesData = await prisma.voteResults.findMany({
    select: {
      candidate: true,
    },
  });
  if (!votesData) {
    logTask("Get Results", "Failed", { error: "No candidates found." });
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
    logTask("Get Results", "Sanitization Failed", { error: err.message });
    return res
      .status(400)
      .json({ error: `Sanitization failed: ${err.message}` });
  }

  const scriptPath = path.resolve(
    __dirname,
    "../../../AuditSmartContract/scripts/StationsTx.ts"
  );
  const command = `npx hardhat run  ${scriptPath} --network private `;

  let countFailedStations: number = 0;
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
                logTask("Get Results", "Script Execution Failed", {
                  error: error.message,
                  stderr,
                });
                return reject(
                  new Error(`Failed to fetch votes for station ${station_id}`)
                );
              }
              logTask("Get Results", "Script Execution Success", {
                output: stdout,
              });
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
      logTask("Get Results", `Error Fetching Votes for ${station_id}`, {
        station_id,
        error: err instanceof Error ? err.message : "Unknown error",
      });
      console.error(
        `Error processing station ${station_id}: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      countFailedStations++;
      continue;
    }
  }

  console.log("Tallied votes:", tallied_votes);

  //Adaugarea voturilor in DB
  try {
    for (const candidate of candidates) {
      // Fetch current votes from DB
      const current = await prisma.voteResults.findUnique({
        where: { candidate },
        select: { votes: true },
      });

      const newVotes = tallied_votes[candidate];
      const oldVotes = current?.votes ?? 0;

      if (newVotes > oldVotes) {
        await prisma.voteResults.update({
          where: { candidate },
          data: { votes: newVotes },
        });
        logTask("Get Results", "Votes Updated for Candidate", {
          candidate,
          oldVotes,
          newVotes,
        });
      } else {
        logTask(
          "Get Results",
          "Votes Not Updated (Not Higher or failed to fetch)",
          {
            candidate,
            oldVotes,
            newVotes,
          }
        );
      }
    }
    logTask("Get Results", "Votes Updated in DB", {
      candidates,
      tallied_votes,
    });
    return res.status(200).json({ message: "Votes updated successfully." });
  } catch (error) {
    console.error("Error updating votes:", error);
    logTask("Get Results", "DB Update Failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return res
      .status(500)
      .json({ error: "Failed to update votes in the database." });
  }
};
