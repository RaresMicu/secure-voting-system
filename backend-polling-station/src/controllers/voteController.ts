import crypto from "crypto";
import { prisma } from "../app";
import { Request, Response } from "express";

//GET: Functie care returneaza toate voturile din cutia securizata pentru audit
export const get_all_secured_votes = async (req: Request, res: Response) => {
  try {
    const secured_votes = await prisma.securedStoringBox.findMany({
      select: {
        candidate: true,
        vote_id: true,
        timestamp: true,
      },
    });

    return res.status(200).json(secured_votes);
  } catch (error) {
    console.error("Error fetching secured_votes:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST: Functie care simuleaza stocarea votului anonim intr-o cutie de vot securizata
export const secure_vote = async (req: Request, res: Response) => {
  const { candidate } = req.body;

  // Validarea inputului
  if (!candidate) {
    return res.status(400).json({ error: "Missing required fields" });
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

    return res.status(201).json(vote);
  } catch (error) {
    console.error("Error securing vote:", error);
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

// PATCH: Functie care simuleaza votarea unui candidat
export const cast_vote = async (req: Request, res: Response) => {
  const { candidate } = req.body;

  if (!candidate) {
    return res.status(400).json({ error: "Missing required fields" });
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

    return res.status(201).json(updated_vote);
  } catch (error) {
    console.error("Error casting vote:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

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
    await prisma.securedStoringBox.deleteMany({});

    return res.status(200).json({ message: "Database reset successfully" });
  } catch (error) {
    console.error("Error resetting database:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET: Functie care primeste in header un hash (simulare a cardului de vot)
// Daca e la fel ca cel din baza de date, se activeaza statia de votare (200)
// Daca nu, se returneaza 401 Unauthorized
export const activate_polling_station = async (req: Request, res: Response) => {
  const activated_key_hash = req.headers.authorization as string;

  if (!activated_key_hash) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Verificarea hash-ului in baza de date
    const station = await prisma.pollingStationActivation.findFirst({
      where: {
        polling_station_hash: activated_key_hash.toString(),
      },
    });

    if (!station) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return res.status(200).json();
  } catch (error) {
    console.error("Error activating polling station:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
