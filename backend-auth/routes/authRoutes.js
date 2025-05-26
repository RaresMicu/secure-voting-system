import express from "express";
import multer from "multer";
import {
  matchFaces,
  matchFingerprints,
  checkId,
} from "../controllers/authController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/facematch",
  upload.fields([
    { name: "reference", maxCount: 1 },
    { name: "query", maxCount: 1 },
  ]),
  matchFaces
);
router.post(
  "/fingerprintmatch",
  upload.fields([
    { name: "reference", maxCount: 1 },
    { name: "query", maxCount: 1 },
  ]),
  matchFingerprints
);
router.post("/checkid", checkId);

export default router;
