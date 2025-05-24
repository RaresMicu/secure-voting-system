import express from "express";
import multer from "multer";
import { matchFaces } from "../controllers/authController.js";

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

export default router;
