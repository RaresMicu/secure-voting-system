import cors from "cors";
import express from "express";
import { PrismaClient } from "@prisma/client";
import voteRouter from "./routes/voteRoutes";
import blockchainRouter from "./routes/blockchainRoutes";
import {
  schedule_initialization_DB,
  schedule_result_sending,
} from "./jobs/jobScheduler";

const app = express();
app.use(cors());
const prisma = new PrismaClient();

app.use(express.json());
app.use("/pollingmachine", voteRouter);
app.use("/blockchain", blockchainRouter);

if (process.env.NODE_ENV !== "test") {
  schedule_initialization_DB();
  schedule_result_sending();
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { prisma, app };
