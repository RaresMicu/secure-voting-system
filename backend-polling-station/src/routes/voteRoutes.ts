import { Router } from "express";
import {
  secure_vote,
  initialize_candidate,
  cast_vote,
  get_all_votes,
  reset_db,
  get_all_secured_votes,
  activate_polling_station,
} from "../controllers/voteController";

const router = Router();

router.get("/castedvotes", get_all_votes);
router.patch("/castedvotes", cast_vote);
router.get("/auditvotes", get_all_secured_votes);
router.post("/securevote", secure_vote);
router.post("/initializecandidate", initialize_candidate);
router.delete("/resetdb", reset_db);
router.get("/activatepollingstation", activate_polling_station);

export default router;
