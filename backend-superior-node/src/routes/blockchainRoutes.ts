import { Router } from "express";
import {
  send_results,
  get_results,
} from "../controllers/blockchainCommunicationController";

const router = Router();

router.post("/sendresults", send_results);
router.post("/getresults", get_results);

export default router;
