import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const key = crypto.scryptSync(
  process.env.LOG_ENCRYPT_KEY || "no-access",
  "future",
  32
);

function decrypt(encrypted: string): string {
  const [ivHex, encryptedHex] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

const encryptedLogPath = path.resolve(__dirname, "../../logs/audit.log");
const decryptedLogPath = path.resolve(
  __dirname,
  "../../logs/audit_decrypted.log"
);

async function decryptLogFile() {
  if (!fs.existsSync(path.dirname(decryptedLogPath))) {
    fs.mkdirSync(path.dirname(decryptedLogPath), { recursive: true });
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(encryptedLogPath),
    crlfDelay: Infinity,
  });

  const output = fs.createWriteStream(decryptedLogPath, { flags: "w" });

  for await (const line of rl) {
    if (line.trim() === "") continue;
    try {
      const decrypted = decrypt(line);
      output.write(decrypted + "\n");
    } catch (err) {
      output.write(`[DECRYPTION ERROR] ${err}\n`);
    }
  }

  output.close();
  rl.close();
  console.log("Decryption complete. Output written to:", decryptedLogPath);
}

decryptLogFile();
