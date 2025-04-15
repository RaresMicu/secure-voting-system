import { Router } from "express";
import { send_results } from "../controllers/blockchainCommunicationController";

const router = Router();

router.post("/sendresults", send_results);

export default router;
