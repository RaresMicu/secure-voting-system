import { Request, Response } from "express";
import { logTask } from "../utilities/logger";
import { PrismaClient } from "@prisma/client";

// POST: Functie care initializeaza un candidat in baza de date
export const initialize_candidates = async (
  req: Request,
  res: Response,
  prisma: PrismaClient | any
) => {
  logTask("initialize_candidates", "Initializing candidates in the database", {
    candidates: req.body.candidates,
  });
  const { candidates } = req.body;

  if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
    logTask("initialize_candidates", "Failed to initialize candidates", {
      error: "Missing or invalid candidates array",
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

    if (new_candidates) {
      logTask("initialize_candidates", "Candidates initialized successfully", {
        count: new_candidates.count,
      });
    }

    res.status(201).json(new_candidates);
    return;
  } catch (error) {
    logTask("initialize_candidates", "Error initializing candidates", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    console.error("Error initializing candidates:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

// DELETE: Functie care reseteaza baza de date (parte de DEV)
export const reset_db = async (
  req: Request,
  res: Response,
  prisma: PrismaClient | any
) => {
  try {
    // Stergerea tuturor voturilor din baza de date
    logTask("reset_db", "Resetting the database");
    await prisma.voteResults.deleteMany({});

    logTask("reset_db", "Database reset successfully");
    res.status(200).json({ message: "Database reset successfully" });
    return;
  } catch (error) {
    logTask("reset_db", "Error resetting database", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    console.error("Error resetting database:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

// GET: Functie care returneaza toate voturile inregistrate
export const get_all_votes = async (
  req: Request,
  res: Response,
  prisma: PrismaClient | any
) => {
  try {
    // Preluarea tuturor voturilor din baza de date
    logTask("get_all_votes", "Fetching all votes from the database");
    const votes = await prisma.voteResults.findMany({
      select: {
        candidate: true,
        votes: true,
      },
    });

    if (votes) {
      logTask("get_all_votes", "Votes fetched successfully", {
        count: votes.length,
      });
    }

    res.status(200).json(votes);
    return;
  } catch (error) {
    logTask("get_all_votes", "Error fetching votes", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    console.error("Error fetching votes:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
