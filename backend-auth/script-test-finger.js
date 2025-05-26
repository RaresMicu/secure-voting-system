import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { exec } from "child_process";

dotenv.config();

const outDir = "./minutiae/";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject(stderr || error);
      else resolve(stdout);
    });
  });
}

async function matchFingerprints(img1, img2) {
  try {
    const baseName1 = path.parse(img1).name;
    const baseName2 = path.parse(img2).name;

    const base1 = path.join(outDir, baseName1);
    const base2 = path.join(outDir, baseName2);

    // Extract minutiae from image1
    console.log(`Extracting minutiae from ${img1}...`);
    await runCommand(`${process.env.MINDTCT_PATH} ${img1} ${base1}`);

    // Extract minutiae from image2
    console.log(`Extracting minutiae from ${img2}...`);
    await runCommand(`${process.env.MINDTCT_PATH} ${img2} ${base2}`);

    // Run bozorth3 matcher on minutiae files
    console.log("Matching minutiae...");
    const score = await runCommand(
      `${process.env.BOZORTH3_PATH} -m1 ${base1}.xyt ${base2}.xyt`
    );

    console.log(`Matching score: ${score.trim()}`);
    if (parseInt(score.trim(), 10) > 30) {
      console.log("Fingerprints match!");
    } else {
      console.log("Fingerprints do not match.");
    }
    return parseInt(score.trim(), 10);
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
}

const fingerprint1 = path.join("assets", "5010101.png");
const fingerprint2 = path.join("assets", "5020404", "5020404_finger.png");

matchFingerprints(fingerprint1, fingerprint2);
