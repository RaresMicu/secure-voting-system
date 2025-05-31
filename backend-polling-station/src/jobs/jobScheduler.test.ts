import { schedule_initialization_DB, schedule_result_sending } from "./jobScheduler";
import { logTask } from "../utilities/logger";

jest.mock("node-cron", () => ({
  schedule: jest.fn((cron, fn) => {
    fn();
  }),
}));
jest.mock("../utilities/logger", () => ({
  logTask: jest.fn(),
}));

describe("jobScheduler", () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch" as any);
    jest.clearAllMocks();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe("schedule_initialization_DB", () => {
    it("should reset and initialize the database and log success", async () => {
      fetchSpy
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ reset: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ initialized: true }),
        });

      schedule_initialization_DB();

      // Wait for async code to run
      await new Promise(process.nextTick);

      expect(fetchSpy).toHaveBeenCalledWith(
        "http://localhost:3000/pollingmachine/resetdb",
        expect.objectContaining({ method: "DELETE" })
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        "http://localhost:3000/pollingmachine/initializecandidates",
        expect.objectContaining({ method: "POST" })
      );
      expect(logTask).toHaveBeenCalledWith(
        "Initialization DB",
        "Success",
        expect.objectContaining({ message: "Database reset successfully" })
      );
      expect(logTask).toHaveBeenCalledWith(
        "Initialization DB",
        "Success",
        expect.objectContaining({ message: "Database initialized with candidates successfully" })
      );
    });

    it("should log error if reset fails", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      schedule_initialization_DB();
      await new Promise(process.nextTick);

      expect(logTask).toHaveBeenCalledWith(
        "Initialization DB",
        "Error",
        expect.objectContaining({ message: expect.stringContaining("Failed to reset database") })
      );
    });
  });

  describe("schedule_result_sending", () => {
    it("should send results and log success", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sent: true }),
      });

      schedule_result_sending();
      await new Promise(process.nextTick);

      expect(fetchSpy).toHaveBeenCalledWith(
        "http://localhost:3000/blockchain/sendresults",
        expect.objectContaining({ method: "POST" })
      );
      expect(logTask).toHaveBeenCalledWith(
        "Send Results to Blockchain",
        "Success",
        expect.objectContaining({ message: "Results sent to blockchain successfully" })
      );
    });

    it("should log error if sending fails", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      schedule_result_sending();
      await new Promise(process.nextTick);

      expect(logTask).toHaveBeenCalledWith(
        "Send Results to Blockchain",
        "Error",
        expect.objectContaining({ message: expect.stringContaining("Failed to send results") })
      );
    });
  });
});