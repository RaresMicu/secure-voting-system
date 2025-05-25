import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const logFilePath = path.resolve(__dirname, "../logs/audit.log");
const key = crypto.scryptSync(
  process.env.LOG_ENCRYPT_KEY || "no-access",
  "future",
  32
);

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function logTask(task: string, status: string, extra?: any) {
  const now = new Date();
  const timestamp = now.toISOString().replace("T", " ").substring(0, 19);
  let logLine = `[${timestamp}] Task: ${task} | Status: ${status}`;
  if (extra !== undefined) {
    logLine += ` | Response: ${JSON.stringify(extra)}`;
  }
  const encryptedLogLine = encrypt(logLine);
  // Ensure the logs directory exists
  if (!fs.existsSync(path.dirname(logFilePath))) {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
  }
  fs.appendFileSync(logFilePath, encryptedLogLine + "\n");
}
