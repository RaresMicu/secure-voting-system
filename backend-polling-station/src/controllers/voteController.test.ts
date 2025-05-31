// Mock logger
jest.mock("../utilities/logger", () => ({
  logTask: jest.fn(),
}));

// Mock Prisma
jest.mock("../app", () => {
  const actual = jest.requireActual("../app");
  return {
    ...actual,
    prisma: {
      securedStoringBox: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { candidate: "Alice", vote_id: "abc123", timestamp: new Date() },
          ]),
        create: jest.fn().mockResolvedValue({
          vote_id: "hash",
          candidate: "A",
        }),
        deleteMany: jest.fn().mockResolvedValue({}),
      },
      voteResults: {
        findMany: jest.fn().mockResolvedValue([{ candidate: "A", votes: 1 }]),
        update: jest.fn().mockResolvedValue({ candidate: "A", votes: 2 }),
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
        deleteMany: jest.fn().mockResolvedValue({}),
      },
      pollingStationActivation: {
        findFirst: jest.fn((args) => {
          if (args.where.polling_station_hash === "hash") {
            return { polling_station_hash: "hash" };
          }
          return null;
        }),
      },
    },
  };
});

import request from "supertest";
import { app, prisma } from "../app";

describe("Vote Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /pollingmachine/auditvotes", () => {
    it("should return all secured votes", async () => {
      (prisma.securedStoringBox.findMany as jest.Mock).mockResolvedValue([
        {
          candidate: "Alice",
          vote_id: "abc123",
          timestamp: new Date(),
        },
      ]);
      const res = await request(app).get("/pollingmachine/auditvotes");
      console.log("Response body:", res.body);

      expect(res.status).toBe(200);
      expect(res.body[0]).toEqual(
        expect.objectContaining({
          candidate: "Alice",
          vote_id: "abc123",
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe("POST /pollingmachine/securevote", () => {
    it("should secure a vote", async () => {
      (prisma.securedStoringBox.create as jest.Mock).mockResolvedValue({
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
  });

  describe("GET /pollingmachine/castedvotes", () => {
    it("should return all votes", async () => {
      (prisma.voteResults.findMany as jest.Mock).mockResolvedValue([
        { candidate: "A", votes: 1 },
      ]);
      const res = await request(app).get("/pollingmachine/castedvotes");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ candidate: "A", votes: 1 }]);
    });
  });

  describe("PATCH /pollingmachine/castedvotes", () => {
    it("should cast a vote", async () => {
      (prisma.voteResults.update as jest.Mock).mockResolvedValue({
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
  });

  describe("POST /pollingmachine/initializecandidates", () => {
    it("should initialize candidates", async () => {
      (prisma.voteResults.createMany as jest.Mock).mockResolvedValue({
        count: 2,
      });
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
  });

  describe("DELETE /pollingmachine/resetdb", () => {
    it("should reset the database", async () => {
      (prisma.voteResults.deleteMany as jest.Mock).mockResolvedValue({});
      (prisma.securedStoringBox.deleteMany as jest.Mock).mockResolvedValue({});
      const res = await request(app).delete("/pollingmachine/resetdb");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("GET /pollingmachine/activatepollingstation", () => {
    it("should activate polling station", async () => {
      (
        prisma.pollingStationActivation.findFirst as jest.Mock
      ).mockResolvedValue({
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
      (
        prisma.pollingStationActivation.findFirst as jest.Mock
      ).mockResolvedValue(null);
      const res = await request(app)
        .get("/pollingmachine/activatepollingstation")
        .set("Authorization", "invalid");
      expect(res.status).toBe(401);
    });
  });
});
