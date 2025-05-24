import path from "path";
import { exec } from "child_process";
import { Request, Response } from "express";
import { logTask } from "../utilities/logger";
import {
  sanitizeEnvString,
  sanitizeEnvList,
} from "../../../shared-utils/sanitize";
import { log } from "console";

export const send_results = async (req: Request, res: Response) => {
  logTask("Send Results to Blockchain", "Started", {
    station_id: req.body.station_id,
  });
  const { station_id } = req.body;
  if (!station_id) {
    logTask("Send Results to Blockchain", "Error", {
      message: "Missing station_id in request body.",
    });
    return res.status(400).json({ error: "Missing station_id." });
  }

  const response = await fetch(
    `http://localhost:3000/pollingmachine/castedvotes`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    logTask("Send Results to Blockchain", "Error", {
      message: `Failed to fetch votes data: ${response.statusText}`,
    });
    return res.status(500).json({ error: "Failed to fetch votes data." });
  }

  const votesData = await response.json();
  logTask("Send Results to Blockchain", "Success", {
    message: "Fetched votes data successfully.",
    data: votesData,
  });
  console.log("Votes data:", votesData);

  let candidates: string[];
  let votes: number[];

  try {
    const rawCandidates = votesData.map((tupple: any) => tupple.candidate);
    const rawVotes = votesData.map((tupple: any) => tupple.votes);

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
    logTask("Send Results to Blockchain", "Error", {
      message: `Sanitization failed: ${err.message}`,
    });
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
        logTask("Send Results to Blockchain", "Error", {
          message: `Script execution failed: ${error.message}`,
          stderr,
        });
        console.error(`Error executing script: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: "Script execution failed." });
      }

      logTask("Send Results to Blockchain", "Success", {
        message: "Script executed successfully.",
        output: stdout,
      });
      res
        .status(200)
        .json({ message: "Script executed successfully.", output: stdout });
    }
  );
};
