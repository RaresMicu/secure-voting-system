import { Router } from "express";
import {
  initialize_candidates,
  reset_db,
  get_all_votes,
} from "../controllers/voteController";

const router = Router();

router.get("/castedvotes", get_all_votes);
router.post("/initializecandidates", initialize_candidates);
router.delete("/resetdb", reset_db);

export default router;
