import { Router } from "express";
import {
  send_results,
  get_results,
} from "../controllers/blockchainCommunicationController";
import { PrismaClient } from "@prisma/client";

// const router = Router();

// router.post("/sendresults", send_results);
// router.post("/getresults", get_results);

// export default router;

export default (prisma: PrismaClient | any) => {
  const router = Router();
  router.post("/sendresults", (req, res) => send_results(req, res, prisma));
  router.post("/getresults", (req, res) => get_results(req, res, prisma));
  return router;
};
