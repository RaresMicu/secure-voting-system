import path from "path";
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
    return res.status(500).json({ error: "Failed to fetch votes data." });
  }

  const votesData = await response.json();

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
