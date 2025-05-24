const faceapi = require("face-api.js");
const canvas = require("canvas");
const path = require("path");
const fs = require("fs");

// Patch environment for face-api.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load TensorFlow
// require('@tensorflow/tfjs-node');

const MODEL_URL = path.join(__dirname, "models");

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
}

async function loadImage(filePath) {
  const img = await canvas.loadImage(filePath);
  return faceapi.createCanvasFromMedia(img);
}

async function getDescriptor(imagePath) {
  const img = await canvas.loadImage(imagePath);
  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    throw new Error(`No face detected in ${imagePath}`);
  }

  return detection.descriptor;
}

async function main() {
  await loadModels();

  const descriptor1 = await getDescriptor("./Rares1.jpg");
  const descriptor2 = await getDescriptor("./Rares3.png");

  const labeledDescriptor = new faceapi.LabeledFaceDescriptors("Known Person", [
    descriptor1,
  ]);
  const faceMatcher = new faceapi.FaceMatcher([labeledDescriptor], 0.6);

  const bestMatch = faceMatcher.findBestMatch(descriptor2);
  console.log("Best match:", bestMatch.toString());
}

main().catch(console.error);
