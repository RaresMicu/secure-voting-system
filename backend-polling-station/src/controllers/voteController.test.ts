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
      securedStoringBox: {
        findMany: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      voteResults: {
        findMany: jest.fn(),
        update: jest.fn(),
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      pollingStationActivation: {
        findFirst: jest.fn(),
      },
    };
    app = express();
    app.use(express.json());
    app.use("/pollingmachine", voteRoutes(mockPrisma));
    jest.clearAllMocks();
  });

  describe("GET /pollingmachine/auditvotes", () => {
    it("should return all secured votes", async () => {
      mockPrisma.securedStoringBox.findMany.mockResolvedValue([
        { candidate: "Alice", vote_id: "abc123", timestamp: new Date() },
      ]);
      const res = await request(app).get("/pollingmachine/auditvotes");
      expect(res.status).toBe(200);
      expect(res.body[0]).toEqual(
        expect.objectContaining({
          candidate: "Alice",
          vote_id: "abc123",
          timestamp: expect.any(String),
        })
      );
    });

    it("should return 500 if findMany throws", async () => {
      mockPrisma.securedStoringBox.findMany.mockRejectedValueOnce(
        new Error("fail")
      );
      const res = await request(app).get("/pollingmachine/auditvotes");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("POST /pollingmachine/securevote", () => {
    it("should secure a vote", async () => {
      mockPrisma.securedStoringBox.create.mockResolvedValue({
        vote_id: "hash",
        candidate: "A",
      });
      const res = await request(app)
        .post("/pollingmachine/securevote")
        .send({ candidate: "A" });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("vote_id");
    });

    it("should return 400 if candidate missing", async () => {
      const res = await request(app)
        .post("/pollingmachine/securevote")
        .send({});
      expect(res.status).toBe(400);
    });

    it("should return 500 if create throws", async () => {
      mockPrisma.securedStoringBox.create.mockRejectedValueOnce(
        new Error("fail")
      );
      const res = await request(app)
        .post("/pollingmachine/securevote")
        .send({ candidate: "A" });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("GET /pollingmachine/castedvotes", () => {
    it("should return all votes", async () => {
      mockPrisma.voteResults.findMany.mockResolvedValue([
        { candidate: "A", votes: 1 },
      ]);
      const res = await request(app).get("/pollingmachine/castedvotes");
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

  describe("PATCH /pollingmachine/castedvotes", () => {
    it("should cast a vote", async () => {
      mockPrisma.voteResults.update.mockResolvedValue({
        candidate: "A",
        votes: 2,
      });
      const res = await request(app)
        .patch("/pollingmachine/castedvotes")
        .send({ candidate: "A" });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("candidate", "A");
    });

    it("should return 400 if candidate missing", async () => {
      const res = await request(app)
        .patch("/pollingmachine/castedvotes")
        .send({});
      expect(res.status).toBe(400);
    });

    it("should return 500 if update throws", async () => {
      mockPrisma.voteResults.update.mockRejectedValueOnce(new Error("fail"));
      const res = await request(app)
        .patch("/pollingmachine/castedvotes")
        .send({ candidate: "A" });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("POST /pollingmachine/initializecandidates", () => {
    it("should initialize candidates", async () => {
      mockPrisma.voteResults.createMany.mockResolvedValue({ count: 2 });
      const res = await request(app)
        .post("/pollingmachine/initializecandidates")
        .send({ candidates: ["A", "B"] });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("count", 2);
    });

    it("should return 400 if candidates missing or invalid", async () => {
      const res = await request(app)
        .post("/pollingmachine/initializecandidates")
        .send({});
      expect(res.status).toBe(400);
    });

    it("should return 500 if createMany throws", async () => {
      mockPrisma.voteResults.createMany.mockRejectedValueOnce(
        new Error("fail")
      );
      const res = await request(app)
        .post("/pollingmachine/initializecandidates")
        .send({ candidates: ["A", "B"] });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("DELETE /pollingmachine/resetdb", () => {
    it("should reset the database", async () => {
      mockPrisma.voteResults.deleteMany.mockResolvedValue({});
      mockPrisma.securedStoringBox.deleteMany.mockResolvedValue({});
      const res = await request(app).delete("/pollingmachine/resetdb");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });
    it("should return 500 if voteResults.deleteMany throws", async () => {
      mockPrisma.voteResults.deleteMany.mockRejectedValueOnce(
        new Error("fail")
      );
      const res = await request(app).delete("/pollingmachine/resetdb");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("GET /pollingmachine/activatepollingstation", () => {
    it("should activate polling station", async () => {
      mockPrisma.pollingStationActivation.findFirst.mockResolvedValue({
        polling_station_hash: "hash",
      });
      const res = await request(app)
        .get("/pollingmachine/activatepollingstation")
        .set("Authorization", "hash");
      expect(res.status).toBe(200);
    });

    it("should return 400 if authorization header missing", async () => {
      const res = await request(app).get(
        "/pollingmachine/activatepollingstation"
      );
      expect(res.status).toBe(400);
    });

    it("should return 401 if station not found", async () => {
      mockPrisma.pollingStationActivation.findFirst.mockResolvedValue(null);
      const res = await request(app)
        .get("/pollingmachine/activatepollingstation")
        .set("Authorization", "invalid");
      expect(res.status).toBe(401);
    });
  });
  it("should return 500 if findFirst throws", async () => {
    mockPrisma.pollingStationActivation.findFirst.mockRejectedValueOnce(
      new Error("fail")
    );
    const res = await request(app)
      .get("/pollingmachine/activatepollingstation")
      .set("Authorization", "hash");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal server error" });
  });
});
