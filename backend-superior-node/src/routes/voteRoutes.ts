import { Router } from "express";
import {
  initialize_candidates,
  reset_db,
  get_all_votes,
} from "../controllers/voteController";
import { PrismaClient } from "@prisma/client";

export default (prisma: PrismaClient | any) => {
  const router = Router();
  router.post("/initializecandidates", (req, res) =>
    initialize_candidates(req, res, prisma)
  );
  router.delete("/resetdb", (req, res) => reset_db(req, res, prisma));
  router.get("/castedvotes", (req, res) => get_all_votes(req, res, prisma));
  return router;
};
