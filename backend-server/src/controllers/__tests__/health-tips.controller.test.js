import { describe, it, expect, vi } from "vitest";
import {
  getAllHealthTips,
  getRandomHealthTips,
  getHealthTipCategories,
} from "../health-tips.controller.js";

/**
 * Unit tests for health-tips.controller.js
 * Validates: Requirements 2.4, 2.5, 3.2, 7.1
 */

// Helper to create mock req/res
function createMocks(query = {}) {
  const req = { query };
  const jsonFn = vi.fn();
  const statusFn = vi.fn(() => ({ json: jsonFn }));
  const res = { status: statusFn };
  return { req, res, statusFn, jsonFn };
}

describe("health-tips.controller", () => {
  describe("getAllHealthTips", () => {
    it("should return 200 with success status, count, and data array", async () => {
      const { req, res, statusFn, jsonFn } = createMocks();
      await getAllHealthTips(req, res);

      expect(statusFn).toHaveBeenCalledWith(200);
      const body = jsonFn.mock.calls[0][0];
      expect(body.status).toBe("success");
      expect(typeof body.count).toBe("number");
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.count).toBe(body.data.length);
    });

    it("should filter tips by valid category", async () => {
      const { req, res, statusFn, jsonFn } = createMocks({
        category: "sleep",
      });
      await getAllHealthTips(req, res);

      expect(statusFn).toHaveBeenCalledWith(200);
      const body = jsonFn.mock.calls[0][0];
      expect(body.status).toBe("success");
      expect(body.data.every((tip) => tip.category === "sleep")).toBe(true);
    });

    it("should return 400 for invalid category", async () => {
      const { req, res, statusFn, jsonFn } = createMocks({
        category: "invalid_cat",
      });
      await getAllHealthTips(req, res);

      expect(statusFn).toHaveBeenCalledWith(400);
      const body = jsonFn.mock.calls[0][0];
      expect(body.status).toBe("error");
      expect(body.message).toContain("invalid_cat");
    });

    it("should return 500 when an unexpected error occurs", async () => {
      const req = {
        get query() {
          throw new Error("unexpected failure");
        },
      };
      const jsonFn = vi.fn();
      const statusFn = vi.fn(() => ({ json: jsonFn }));
      const res = { status: statusFn };

      await getAllHealthTips(req, res);

      expect(statusFn).toHaveBeenCalledWith(500);
      const body = jsonFn.mock.calls[0][0];
      expect(body.status).toBe("error");
      expect(body.message).toBe("unexpected failure");
    });
  });

  describe("getRandomHealthTips", () => {
    it("should return 200 with success status and data array (default count=1)", async () => {
      const { req, res, statusFn, jsonFn } = createMocks();
      await getRandomHealthTips(req, res);

      expect(statusFn).toHaveBeenCalledWith(200);
      const body = jsonFn.mock.calls[0][0];
      expect(body.status).toBe("success");
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data).toHaveLength(1);
    });

    it("should return requested number of tips when count is valid", async () => {
      const { req, res, statusFn, jsonFn } = createMocks({ count: "3" });
      await getRandomHealthTips(req, res);

      expect(statusFn).toHaveBeenCalledWith(200);
      const body = jsonFn.mock.calls[0][0];
      expect(body.data).toHaveLength(3);
    });

    it("should return 400 when count is 0", async () => {
      const { req, res, statusFn, jsonFn } = createMocks({ count: "0" });
      await getRandomHealthTips(req, res);

      expect(statusFn).toHaveBeenCalledWith(400);
      const body = jsonFn.mock.calls[0][0];
      expect(body.status).toBe("error");
    });

    it("should return 400 when count is negative", async () => {
      const { req, res, statusFn, jsonFn } = createMocks({ count: "-1" });
      await getRandomHealthTips(req, res);

      expect(statusFn).toHaveBeenCalledWith(400);
      const body = jsonFn.mock.calls[0][0];
      expect(body.status).toBe("error");
    });

    it("should return 400 when count is not a number", async () => {
      const { req, res, statusFn, jsonFn } = createMocks({ count: "abc" });
      await getRandomHealthTips(req, res);

      expect(statusFn).toHaveBeenCalledWith(400);
      const body = jsonFn.mock.calls[0][0];
      expect(body.status).toBe("error");
    });

    it("should return 400 when count is a decimal", async () => {
      const { req, res, statusFn, jsonFn } = createMocks({ count: "1.5" });
      await getRandomHealthTips(req, res);

      expect(statusFn).toHaveBeenCalledWith(400);
      const body = jsonFn.mock.calls[0][0];
      expect(body.status).toBe("error");
    });

    it("should return 400 for invalid category", async () => {
      const { req, res, statusFn, jsonFn } = createMocks({
        category: "bogus",
      });
      await getRandomHealthTips(req, res);

      expect(statusFn).toHaveBeenCalledWith(400);
      const body = jsonFn.mock.calls[0][0];
      expect(body.status).toBe("error");
      expect(body.message).toContain("bogus");
    });

    it("should filter by category when both count and category provided", async () => {
      const { req, res, statusFn, jsonFn } = createMocks({
        count: "2",
        category: "heart",
      });
      await getRandomHealthTips(req, res);

      expect(statusFn).toHaveBeenCalledWith(200);
      const body = jsonFn.mock.calls[0][0];
      expect(body.data.every((tip) => tip.category === "heart")).toBe(true);
    });

    it("should return 500 when an unexpected error occurs", async () => {
      const req = {
        get query() {
          throw new Error("random failure");
        },
      };
      const jsonFn = vi.fn();
      const statusFn = vi.fn(() => ({ json: jsonFn }));
      const res = { status: statusFn };

      await getRandomHealthTips(req, res);

      expect(statusFn).toHaveBeenCalledWith(500);
      const body = jsonFn.mock.calls[0][0];
      expect(body.status).toBe("error");
      expect(body.message).toBe("random failure");
    });
  });

  describe("getHealthTipCategories", () => {
    it("should return 200 with success status and data array of categories", async () => {
      const { req, res, statusFn, jsonFn } = createMocks();
      await getHealthTipCategories(req, res);

      expect(statusFn).toHaveBeenCalledWith(200);
      const body = jsonFn.mock.calls[0][0];
      expect(body.status).toBe("success");
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(6);
      for (const cat of body.data) {
        expect(cat).toHaveProperty("key");
        expect(cat).toHaveProperty("name");
        expect(cat).toHaveProperty("count");
      }
    });

    it("should return 500 when an unexpected error occurs", async () => {
      // Trigger error by making res.status(200).json() throw on first call,
      // then work normally for the catch block's res.status(500).json()
      let callCount = 0;
      const jsonFn = vi.fn();
      const statusFn = vi.fn((code) => {
        callCount++;
        if (callCount === 1) {
          return {
            json: () => {
              throw new Error("json serialization failed");
            },
          };
        }
        return { json: jsonFn };
      });
      const req = { query: {} };
      const res = { status: statusFn };

      await getHealthTipCategories(req, res);

      expect(statusFn).toHaveBeenCalledWith(500);
      const body = jsonFn.mock.calls[0][0];
      expect(body.status).toBe("error");
      expect(body.message).toBe("json serialization failed");
    });
  });
});
