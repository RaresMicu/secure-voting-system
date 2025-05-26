import fs from "fs";
import path from "path";
import canvas from "canvas";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import * as faceapi from "face-api.js";
import { logTask } from "../utilities/logger.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ID checking in the database

export const checkId = async (req, res) => {
  try {
    const { queryId } = req.body;
    logTask("checkId", "Started", queryId);

    if (!queryId) {
      logTask("checkId", "Failed", {
        error: "Query ID is required",
      });
      return res.status(400).json({ error: "Query ID is required" });
    }

    const queryDir = path.join(__dirname, "..", "assets", `${queryId}`);
    if (!fs.existsSync(queryDir)) {
      logTask("checkId", "Authentication failed", {
        error: `ID is not in the database: ${queryId}`,
      });
      return res
        .status(404)
        .json({ error: `ID is not in the database: ${queryId}` });
    }

    logTask("checkId", "Completed");
    return res.json({ result: true, message: "ID exists in the database." });
  } catch (error) {
    logTask("checkId", "Error", {
      error: error.message,
    });
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};

//FINGERPRINT MATCHING//////////////////////////////////////

const outDir = "../minutiae/";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject(stderr || error);
      else resolve(stdout);
    });
  });
}

export const matchFingerprints = async (req, res) => {
  try {
    const { reference } = req.files;
    const { queryId } = req.body;
    logTask("matchFingerprints", "Started", queryId);
    console.log("QueryID: ", queryId);

    if (!queryId) {
      logTask("matchFingerprints", {
        error: "Query ID is required",
      });
      return res.status(400).json({ error: "Query ID is required" });
    }

    const refPath = reference[0].path;
    const queryDir = path.join(__dirname, "..", "assets", `${queryId}`);
    const queryPath = path.join(queryDir, `${queryId}_finger.png`);

    const baseName1 = path.parse(refPath).name;
    const baseName2 = path.parse(queryPath).name;
    const base1 = path.join(outDir, baseName1);
    const base2 = path.join(outDir, baseName2);

    // Extract minutiae from reference image
    console.log(`Extracting minutiae from ${refPath}...`);
    await runCommand(`${process.env.MINDTCT_PATH} ${refPath} ${base1}`);

    // Extract minutiae from query image
    console.log(`Extracting minutiae from ${queryPath}...`);
    await runCommand(`${process.env.MINDTCT_PATH} ${queryPath} ${base2}`);

    // Run bozorth3 matcher on minutiae files
    console.log("Matching minutiae...");
    const score = await runCommand(
      `${process.env.BOZORTH3_PATH} -m1 ${base1}.xyt ${base2}.xyt`
    );

    console.log(`Matching score: ${score.trim()}`);

    // Clean up temp files
    fs.unlinkSync(refPath);

    if (parseInt(score.trim(), 10) > 30) {
      logTask("matchFingerprints", "Completed", "Fingerprints match!");
      return res.json({ match: true });
    } else {
      logTask("matchFingerprints", "Completed", "Fingerprints do not match.");
      return res.json({ match: false });
    }
  } catch (error) {
    logTask("matchFingerprints", "Error", {
      error: error.message,
    });
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};

//FACE RECOGNITION////////////////////////////////////////

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODEL_PATH = path.join(__dirname, "..", "models");

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
}

async function getDescriptor(imagePath) {
  const img = await canvas.loadImage(imagePath);
  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) throw new Error(`No face found in ${imagePath}`);
  return detection.descriptor;
}

export const matchFaces = async (req, res) => {
  try {
    const { reference } = req.files;
    const { queryId } = req.body;
    logTask("matchFaces", "Started", queryId);
    console.log("QueryID: ", queryId);

    if (!queryId) {
      logTask("matchFaces", {
        error: "Query ID is required",
      });
      return res.status(400).json({ error: "Query ID is required" });
    }

    const refPath = reference[0].path;
    const queryDir = path.join(__dirname, "..", "assets", `${queryId}`);
    const queryPath = path.join(queryDir, `${queryId}.jpg`);
    console.log("Path: ", queryPath);

    if (!fs.existsSync(queryPath)) {
      logTask("matchFaces", {
        error: `No image found for ID: ${queryId}`,
      });
      return res
        .status(404)
        .json({ error: `No image found for ID: ${queryId}` });
    }

    await loadModels();

    const descriptor1 = await getDescriptor(refPath);
    const descriptor2 = await getDescriptor(queryPath);

    const faceMatcher = new faceapi.FaceMatcher(
      [new faceapi.LabeledFaceDescriptors("Reference", [descriptor1])],
      0.6
    );

    const result = faceMatcher.findBestMatch(descriptor2);

    // Clean up temp files
    fs.unlinkSync(refPath);
    console.log(result.toString());
    logTask("matchFaces", result.toString());
    return res.json({ match: result.toString(), distance: result.distance });
  } catch (error) {
    logTask("matchFaces", {
      error: error.message,
    });
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};
