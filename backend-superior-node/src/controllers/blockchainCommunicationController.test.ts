import express from "express";
import { send_results, get_results } from "./blockchainCommunicationController";
import request from "supertest";

// Mock logger and sanitizers
jest.mock("../utilities/logger", () => ({
  logTask: jest.fn(),
}));
jest.mock("../../../shared-utils/sanitize", () => ({
  sanitizeEnvList: jest.fn((name, value) => value.split(",")),
  sanitizeEnvString: jest.fn(),
}));

// Mock child_process.exec
import { exec } from "child_process";
jest.mock("child_process", () => ({
  exec: jest.fn(),
}));

describe("blockchainCommunicationController", () => {
  let app: express.Express;
  let mockPrisma: any;
  let mockExec: jest.Mock;

  beforeEach(() => {
    mockPrisma = {
      voteResults: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    app = express();
    app.use(express.json());
    // Mount routes for testing
    app.post("/blockchain/sendresults", (req, res) =>
      send_results(req, res, mockPrisma)
    );
    app.post("/blockchain/getresults", (req, res) =>
      get_results(req, res, mockPrisma)
    );
    jest.clearAllMocks();
    mockExec = require("child_process").exec;
  });

  describe("POST /blockchain/sendresults", () => {
    it("should return 400 if station_id is missing", async () => {
      const res = await request(app).post("/blockchain/sendresults").send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Missing station_id." });
    });

    it("should return 404 if no votes data found", async () => {
      mockPrisma.voteResults.findMany.mockResolvedValue(null);
      const res = await request(app)
        .post("/blockchain/sendresults")
        .send({ station_id: "station1" });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "No votes data found." });
    });

    it("should return 400 if sanitization fails", async () => {
      mockPrisma.voteResults.findMany.mockResolvedValue([
        { candidate: "A", votes: 1 },
      ]);
      const { sanitizeEnvList } = require("../../../shared-utils/sanitize");
      sanitizeEnvList.mockImplementationOnce(() => {
        throw new Error("bad sanitize");
      });
      const res = await request(app)
        .post("/blockchain/sendresults")
        .send({ station_id: "station1" });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Sanitization failed");
    });

    it("should return 500 if script execution fails", async () => {
      mockPrisma.voteResults.findMany.mockResolvedValue([
        { candidate: "A", votes: 1 },
      ]);
      mockExec.mockImplementation((_cmd, _opts, cb) => {
        cb(new Error("fail"), "", "stderr");
      });
      const res = await request(app)
        .post("/blockchain/sendresults")
        .send({ station_id: "station1" });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Script execution failed." });
    });

    it("should return 200 if script executes successfully", async () => {
      mockPrisma.voteResults.findMany.mockResolvedValue([
        { candidate: "A", votes: 1 },
      ]);
      mockExec.mockImplementation((_cmd, _opts, cb) => {
        cb(null, "success!", "");
      });
      const res = await request(app)
        .post("/blockchain/sendresults")
        .send({ station_id: "station1" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "Script executed successfully.",
        output: "success!",
      });
    });
  });

  describe("POST /blockchain/getresults", () => {
    it("should return 400 if station_ids is missing or not an array", async () => {
      const res = await request(app).post("/blockchain/getresults").send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Missing station_ids or bad format." });
    });

    it("should return 404 if no candidates found", async () => {
      mockPrisma.voteResults.findMany.mockResolvedValue(null);
      const res = await request(app)
        .post("/blockchain/getresults")
        .send({ station_ids: ["station1"] });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "No candidates found." });
    });

    it("should return 400 if sanitization fails", async () => {
      mockPrisma.voteResults.findMany.mockResolvedValue([{ candidate: "A" }]);
      const { sanitizeEnvList } = require("../../../shared-utils/sanitize");
      sanitizeEnvList.mockImplementationOnce(() => {
        throw new Error("bad sanitize");
      });
      const res = await request(app)
        .post("/blockchain/getresults")
        .send({ station_ids: ["station1"] });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Sanitization failed");
    });

    it("should return 200 if everything works (mocking exec and DB)", async () => {
      mockPrisma.voteResults.findMany.mockResolvedValue([{ candidate: "A" }]);
      mockPrisma.voteResults.findUnique.mockResolvedValue({ votes: 1 });
      mockPrisma.voteResults.update.mockResolvedValue({});
      const { sanitizeEnvList } = require("../../../shared-utils/sanitize");
      sanitizeEnvList.mockImplementation((name: any, value: any) =>
        value.split(",")
      );
      // Mock exec to return votes as JSON string
      mockExec.mockImplementation((_cmd, _opts, cb) => {
        cb(null, JSON.stringify(["2"]), "");
      });
      const res = await request(app)
        .post("/blockchain/getresults")
        .send({ station_ids: ["station1"] });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Votes updated successfully." });
    });

    it("should return 500 if DB update fails", async () => {
      mockPrisma.voteResults.findMany.mockResolvedValue([{ candidate: "A" }]);
      mockPrisma.voteResults.findUnique.mockResolvedValue({ votes: 1 });
      mockPrisma.voteResults.update.mockRejectedValueOnce(new Error("fail"));
      const { sanitizeEnvList } = require("../../../shared-utils/sanitize");
      sanitizeEnvList.mockImplementation((name: any, value: any) =>
        value.split(",")
      );
      mockExec.mockImplementation((_cmd, _opts, cb) => {
        cb(null, JSON.stringify(["2"]), "");
      });
      const res = await request(app)
        .post("/blockchain/getresults")
        .send({ station_ids: ["station1"] });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: "Failed to update votes in the database.",
      });
    });
  });
});
