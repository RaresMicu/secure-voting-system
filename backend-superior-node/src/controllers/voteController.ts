import crypto from "crypto";
import { prisma } from "../app";
import { Request, Response } from "express";

// POST: Functie care initializeaza un candidat in baza de date
export const initialize_candidates = async (req: Request, res: Response) => {
  const { candidates } = req.body;

  if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
    return res
      .status(400)
      .json({ error: "Missing or invalid candidates array" });
  }

  try {
    const new_candidates = await prisma.voteResults.createMany({
      data: candidates.map((candidate: string) => ({
        candidate,
      })),
    });

    return res.status(201).json(new_candidates);
  } catch (error) {
    console.error("Error initializing candidates:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE: Functie care reseteaza baza de date (parte de DEV)
export const reset_db = async (req: Request, res: Response) => {
  try {
    // Stergerea tuturor voturilor din baza de date
    await prisma.voteResults.deleteMany({});

    return res.status(200).json({ message: "Database reset successfully" });
  } catch (error) {
    console.error("Error resetting database:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET: Functie care returneaza toate voturile inregistrate
export const get_all_votes = async (req: Request, res: Response) => {
  try {
    // Preluarea tuturor voturilor din baza de date
    const votes = await prisma.voteResults.findMany({
      select: {
        candidate: true,
        votes: true,
      },
    });

    return res.status(200).json(votes);
  } catch (error) {
    console.error("Error fetching votes:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
