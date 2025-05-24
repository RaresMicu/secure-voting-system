import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFilePath = path.resolve(__dirname, "../logs/audit.log");

export function logTask(task, status, extra) {
  const now = new Date();
  const timestamp = now.toISOString().replace("T", " ").substring(0, 19);
  let logLine = `[${timestamp}] Task: ${task} | Status: ${status}`;
  if (extra !== undefined) {
    logLine += ` | Response: ${JSON.stringify(extra)}`;
  }
  fs.appendFileSync(logFilePath, logLine + "\n");
}
