import { Router } from "express";
import {
  secure_vote,
  initialize_candidates,
  cast_vote,
  get_all_votes,
  reset_db,
  get_all_secured_votes,
  activate_polling_station,
} from "../controllers/voteController";
import { PrismaClient } from "@prisma/client";

// const router = Router();

// router.get("/castedvotes", get_all_votes);
// router.patch("/castedvotes", cast_vote);
// router.get("/auditvotes", get_all_secured_votes);
// router.post("/securevote", secure_vote);
// router.post("/initializecandidates", initialize_candidates);
// router.delete("/resetdb", reset_db);
// router.get("/activatepollingstation", activate_polling_station);

// export default router;

export default (prisma: PrismaClient | any) => {
  const router = Router();

  router.get("/castedvotes", (req, res) => get_all_votes(req, res, prisma));
  router.patch("/castedvotes", (req, res) => cast_vote(req, res, prisma));
  router.get("/auditvotes", (req, res) =>
    get_all_secured_votes(req, res, prisma)
  );
  router.post("/securevote", (req, res) => secure_vote(req, res, prisma));
  router.post("/initializecandidates", (req, res) =>
    initialize_candidates(req, res, prisma)
  );
  router.delete("/resetdb", (req, res) => reset_db(req, res, prisma));
  router.get("/activatepollingstation", (req, res) =>
    activate_polling_station(req, res, prisma)
  );

  return router;
};
