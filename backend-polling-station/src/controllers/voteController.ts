import crypto from "crypto";
import { prisma } from "../app";
import { Request, Response } from "express";
import { logTask } from "../utilities/logger";

//GET: Functie care returneaza toate voturile din cutia securizata pentru audit
export const get_all_secured_votes = async (req: Request, res: Response) => {
  logTask("Get All Secured Votes", "Started");
  try {
    const secured_votes = await prisma.securedStoringBox.findMany({
      select: {
        candidate: true,
        vote_id: true,
        timestamp: true,
      },
    });

    if (!secured_votes) {
      logTask("Get All Secured Votes", "Error", {
        message: "Internal server error.",
      });
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    logTask("Get All Secured Votes", "Success", {
      message: "Fetched all secured votes successfully.",
      count: secured_votes.length,
    });
    res.status(200).json(secured_votes);
  } catch (error) {
    logTask("Get All Secured Votes", "Error", {
      message: `Failed to fetch secured votes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
    console.error("Error fetching secured_votes:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

// POST: Functie care simuleaza stocarea votului anonim intr-o cutie de vot securizata
export const secure_vote = async (req: Request, res: Response) => {
  const { candidate } = req.body;
  logTask("Secure Vote", "Started", {
    candidate,
  });
  // Validarea inputului
  if (!candidate) {
    logTask("Secure Vote", "Error", {
      message: "Missing required fields in request body.",
    });
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    // Generarea unui id unic, pentru a nu se putea identifica alegatorul in cazul unui id incremental
    const vote_id = crypto.randomUUID();
    const vote_hash = crypto
      .createHash("sha256")
      .update(`${vote_id}${candidate}`)
      .digest("hex");

    // Stocarea in baza de date
    const vote = await prisma.securedStoringBox.create({
      data: {
        vote_id: vote_hash,
        candidate,
      },
    });

    if (!vote) {
      logTask("Secure Vote", "Error", {
        message: "Failed to secure vote in the database.",
      });
      res.status(500).json({ error: "Failed to secure vote" });
      return;
    }
    logTask("Secure Vote", "Success", {
      message: "Vote secured successfully.",
      vote_id: vote.vote_id,
      candidate: vote.candidate,
    });
    res.status(201).json(vote);
  } catch (error) {
    logTask("Secure Vote", "Error", {
      message: `Failed to secure vote: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
    console.error("Error securing vote:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

// GET: Functie care returneaza toate voturile inregistrate
export const get_all_votes = async (
  req: Request,
  res: Response
): Promise<void> => {
  logTask("Get All Votes", "Started");
  try {
    // Preluarea tuturor voturilor din baza de date
    const votes = await prisma.voteResults.findMany({
      select: {
        candidate: true,
        votes: true,
      },
    });

    if (!votes) {
      logTask("Get All Votes", "Error", {
        message: "Internal server error.",
      });
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    logTask("Get All Votes", "Success", {
      message: "Fetched all votes successfully.",
      count: votes.length,
    });
    res.status(200).json(votes);
  } catch (error) {
    logTask("Get All Votes", "Error", {
      message: `Failed to fetch votes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
    console.error("Error fetching votes:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

// PATCH: Functie care simuleaza votarea unui candidat
export const cast_vote = async (req: Request, res: Response) => {
  const { candidate } = req.body;
  logTask("Cast Vote", "Started", {
    candidate,
  });

  if (!candidate) {
    logTask("Cast Vote", "Error", {
      message: "Missing required fields in request body.",
    });
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    // Stocarea votului in baza de date
    const updated_vote = await prisma.voteResults.update({
      where: {
        candidate,
      },
      data: {
        votes: {
          increment: 1,
        },
      },
    });

    if (!updated_vote) {
      logTask("Cast Vote", "Error", {
        message: "Failed to cast vote in the database.",
      });
      res.status(500).json({ error: "Failed to cast vote" });
      return;
    }

    logTask("Cast Vote", "Success", {
      message: "Vote cast successfully.",
      candidate: updated_vote.candidate,
      votes: updated_vote.votes,
    });
    res.status(201).json(updated_vote);
  } catch (error) {
    logTask("Cast Vote", "Error", {
      message: `Failed to cast vote: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
    console.error("Error casting vote:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

// POST: Functie care initializeaza un candidat in baza de date
export const initialize_candidates = async (req: Request, res: Response) => {
  const { candidates } = req.body;
  logTask("Initialize Candidates", "Started", {
    candidates,
  });

  if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
    logTask("Initialize Candidates", "Error", {
      message: "Missing or invalid candidates array in request body.",
    });
    res.status(400).json({ error: "Missing or invalid candidates array" });
    return;
  }

  try {
    const new_candidates = await prisma.voteResults.createMany({
      data: candidates.map((candidate: string) => ({
        candidate,
      })),
    });

    if (!new_candidates) {
      logTask("Initialize Candidates", "Error", {
        message: "Failed to initialize candidates in the database.",
      });
      res.status(500).json({ error: "Failed to initialize candidates" });
      return;
    }

    logTask("Initialize Candidates", "Success", {
      message: "Candidates initialized successfully.",
      count: new_candidates.count,
    });
    res.status(201).json(new_candidates);
  } catch (error) {
    logTask("Initialize Candidates", "Error", {
      message: `Failed to initialize candidates: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
    console.error("Error initializing candidates:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

// DELETE: Functie care reseteaza baza de date (parte de DEV)
export const reset_db = async (req: Request, res: Response) => {
  logTask("Reset Database", "Started");
  try {
    // Stergerea tuturor voturilor din baza de date
    await prisma.voteResults.deleteMany({});
    await prisma.securedStoringBox.deleteMany({});

    logTask("Reset Database", "Success", {
      message: "Database reset successfully.",
    });
    res.status(200).json({ message: "Database reset successfully" });
  } catch (error) {
    logTask("Reset Database", "Error", {
      message: `Failed to reset database: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
    console.error("Error resetting database:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

// GET: Functie care primeste in header un hash (simulare a cardului de vot)
// Daca e la fel ca cel din baza de date, se activeaza statia de votare (200)
// Daca nu, se returneaza 401 Unauthorized
export const activate_polling_station = async (req: Request, res: Response) => {
  const activated_key_hash = req.headers.authorization as string;
  logTask("Activate Polling Station", "Started", {
    activated_key_hash,
  });

  if (!activated_key_hash) {
    logTask("Activate Polling Station", "Error", {
      message: "Missing required fields in request headers.",
    });
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    // Verificarea hash-ului in baza de date
    const station = await prisma.pollingStationActivation.findFirst({
      where: {
        polling_station_hash: activated_key_hash.toString(),
      },
    });

    if (!station) {
      logTask("Activate Polling Station", "Error", {
        message: "Unauthorized access attempt with invalid hash.",
      });
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    logTask("Activate Polling Station", "Success", {
      message: "Polling station activated successfully.",
      polling_station_hash: activated_key_hash,
    });
    res.status(200).json();
  } catch (error) {
    logTask("Activate Polling Station", "Error", {
      message: `Failed to activate polling station: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
    console.error("Error activating polling station:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
