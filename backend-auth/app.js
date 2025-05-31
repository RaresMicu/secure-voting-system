import cors from "cors";
import express from "express";
import { PrismaClient } from "./generated/prisma/index.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const prisma = new PrismaClient();

app.use("/auth", authRoutes);

app.listen(3020, () => {
  console.log("Server is running on port 3020");
});

export { app, prisma };
