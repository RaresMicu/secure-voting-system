import express from "express";
import { PrismaClient } from "@prisma/client";
import blockchainRouter from "./routes/blockchainRoutes";
import voteRouter from "./routes/voteRoutes";
import {
  schedule_initialization_DB,
  schedule_tallying_and_blockchain_storing,
} from "./jobs/jobScheduler";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/pollingmachine", voteRouter(prisma));
app.use("/blockchain", blockchainRouter(prisma));

schedule_initialization_DB();
schedule_tallying_and_blockchain_storing();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { prisma, app };
