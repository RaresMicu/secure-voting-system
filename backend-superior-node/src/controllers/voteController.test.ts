import express from "express";
import voteRoutes from "../routes/voteRoutes";
import { logTask } from "../utilities/logger";
import request from "supertest";

// Mock logger
jest.mock("../utilities/logger", () => ({
  logTask: jest.fn(),
}));

describe("voteRoutes", () => {
  let app: express.Express;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      voteResults: {
        createMany: jest.fn(),
        deleteMany: jest.fn(),
        findMany: jest.fn(),
      },
    };
    app = express();
    app.use(express.json());
    app.use("/pollingmachine", voteRoutes(mockPrisma));
    jest.clearAllMocks();
  });

  describe("POST /pollingmachine/initializecandidates", () => {
    it("should return 400 if candidates array is missing or invalid", async () => {
      const res = await request(app)
        .post("/pollingmachine/initializecandidates")
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Missing or invalid candidates array",
      });
    });

    it("should return 201 and call createMany if candidates are valid", async () => {
      mockPrisma.voteResults.createMany.mockResolvedValueOnce({ count: 2 });
      const res = await request(app)
        .post("/pollingmachine/initializecandidates")
        .send({ candidates: ["A", "B"] });
      expect(mockPrisma.voteResults.createMany).toHaveBeenCalledWith({
        data: [{ candidate: "A" }, { candidate: "B" }],
      });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ count: 2 });
    });

    it("should return 500 if createMany throws", async () => {
      mockPrisma.voteResults.createMany.mockRejectedValueOnce(
        new Error("fail")
      );
      const res = await request(app)
        .post("/pollingmachine/initializecandidates")
        .send({ candidates: ["A"] });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("DELETE /pollingmachine/resetdb", () => {
    it("should reset the database and return 200", async () => {
      mockPrisma.voteResults.deleteMany.mockResolvedValueOnce({});
      const res = await request(app).delete("/pollingmachine/resetdb");
      expect(mockPrisma.voteResults.deleteMany).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Database reset successfully" });
    });

    it("should return 500 if deleteMany throws", async () => {
      mockPrisma.voteResults.deleteMany.mockRejectedValueOnce(
        new Error("fail")
      );
      const res = await request(app).delete("/pollingmachine/resetdb");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("GET /pollingmachine/castedvotes", () => {
    it("should return all votes with 200", async () => {
      mockPrisma.voteResults.findMany.mockResolvedValueOnce([
        { candidate: "A", votes: 1 },
      ]);
      const res = await request(app).get("/pollingmachine/castedvotes");
      expect(mockPrisma.voteResults.findMany).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ candidate: "A", votes: 1 }]);
    });

    it("should return 500 if findMany throws", async () => {
      mockPrisma.voteResults.findMany.mockRejectedValueOnce(new Error("fail"));
      const res = await request(app).get("/pollingmachine/castedvotes");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });
    });
  });
});
