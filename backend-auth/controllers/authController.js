import * as faceapi from "face-api.js";
import canvas from "canvas";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    console.log("QueryID: ", queryId);

    if (!queryId) {
      return res.status(400).json({ error: "Query ID is required" });
    }

    const refPath = reference[0].path;
    const queryPath = path.join(__dirname, "..", "assets", `${queryId}.jpg`);
    console.log("Path: ", queryPath);

    if (!fs.existsSync(queryPath)) {
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

    return res.json({ match: result.toString(), distance: result.distance });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};
