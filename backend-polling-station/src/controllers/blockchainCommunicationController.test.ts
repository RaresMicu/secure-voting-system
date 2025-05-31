import { send_results } from "./blockchainCommunicationController";
import { logTask } from "../utilities/logger";
import { sanitizeEnvList, sanitizeEnvString } from "../../../shared-utils/sanitize";

jest.mock("../utilities/logger", () => ({
  logTask: jest.fn(),
}));
jest.mock("../../../shared-utils/sanitize", () => ({
  sanitizeEnvList: jest.fn((name, value) => value.split(",")),
  sanitizeEnvString: jest.fn(),
}));

const mockExec = jest.fn();
jest.mock("child_process", () => ({
  exec: (...args: any[]) => mockExec(...args),
}));

describe("send_results", () => {
  let req: any;
  let res: any;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    req = { body: { station_id: "station1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    fetchSpy = jest.spyOn(global, "fetch" as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
    fetchSpy.mockRestore();
  });

  it("should return 400 if station_id is missing", async () => {
    req.body = {};
    await send_results(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing station_id." });
  });

  it("should return 500 if fetch fails", async () => {
    fetchSpy.mockResolvedValue({ ok: false, statusText: "Not Found" });
    await send_results(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch votes data." });
  });

  it("should return 400 if sanitization fails", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => [{ candidate: "A", votes: 1 }],
    });
    (sanitizeEnvList as jest.Mock).mockImplementationOnce(() => {
      throw new Error("bad sanitize");
    });
    await send_results(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining("Sanitization failed") });
  });

  it("should return 500 if script execution fails", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => [{ candidate: "A", votes: 1 }],
    });
    mockExec.mockImplementation((_cmd, _opts, cb) => {
      cb(new Error("fail"), "", "stderr");
    });
    await send_results(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Script execution failed." });
  });

  it("should return 200 if script executes successfully", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => [{ candidate: "A", votes: 1 }],
    });
    mockExec.mockImplementation((_cmd, _opts, cb) => {
      cb(null, "success!", "");
    });
    await send_results(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Script executed successfully.",
      output: "success!",
    });
  });
});