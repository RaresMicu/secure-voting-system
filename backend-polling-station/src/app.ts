import express from "express";
import { PrismaClient } from "@prisma/client";
import voteRouter from "./routes/voteRoutes";
import blockchainRouter from "./routes/blockchainRoutes";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/pollingmachine", voteRouter);
app.use("/blockchain", blockchainRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { prisma };
