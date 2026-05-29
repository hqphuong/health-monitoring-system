import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import healthTipsRoutes from "../health-tips.routes.js";
import { healthTips } from "../../data/health-tips.data.js";

/**
 * Integration tests for health-tips routes.
 * Validates: Requirements 2.1, 2.2, 2.4, 3.1, 3.2, 4.1, 5.1, 7.1, 7.2
 *
 * Spins up a real Express app on a random port and uses fetch for HTTP requests.
 */

let server;
let baseUrl;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/health-tips", healthTipsRoutes);

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe("GET /api/v1/health-tips", () => {
  it("returns all tips with success status and count", async () => {
    const res = await fetch(`${baseUrl}/api/v1/health-tips`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("success");
    expect(body.count).toBe(healthTips.length);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(healthTips.length);
  });

  it("filters tips by category=sleep", async () => {
    const res = await fetch(`${baseUrl}/api/v1/health-tips?category=sleep`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("success");
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.every((tip) => tip.category === "sleep")).toBe(true);
    expect(body.count).toBe(body.data.length);
  });

  it("returns 400 for invalid category", async () => {
    const res = await fetch(`${baseUrl}/api/v1/health-tips?category=invalid`);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.status).toBe("error");
    expect(body.message).toContain("invalid");
  });
});

describe("GET /api/v1/health-tips/random", () => {
  it("returns 1 random tip by default", async () => {
    const res = await fetch(`${baseUrl}/api/v1/health-tips/random`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("success");
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toHaveProperty("id");
    expect(body.data[0]).toHaveProperty("title");
  });

  it("returns requested count of tips with category filter", async () => {
    const res = await fetch(
      `${baseUrl}/api/v1/health-tips/random?count=3&category=heart`
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("success");
    expect(body.data.length).toBeLessThanOrEqual(3);
    expect(body.data.every((tip) => tip.category === "heart")).toBe(true);
  });

  it("returns 400 for non-integer count", async () => {
    const res = await fetch(`${baseUrl}/api/v1/health-tips/random?count=abc`);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.status).toBe("error");
    expect(body.message).toContain("count");
  });

  it("returns 400 for count=0", async () => {
    const res = await fetch(`${baseUrl}/api/v1/health-tips/random?count=0`);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.status).toBe("error");
  });

  it("returns 400 for invalid category on random endpoint", async () => {
    const res = await fetch(
      `${baseUrl}/api/v1/health-tips/random?category=fake`
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.status).toBe("error");
    expect(body.message).toContain("fake");
  });
});

describe("GET /api/v1/health-tips/categories", () => {
  it("returns all 6 categories with key, name, and count", async () => {
    const res = await fetch(`${baseUrl}/api/v1/health-tips/categories`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("success");
    expect(body.data).toHaveLength(6);
    for (const cat of body.data) {
      expect(cat).toHaveProperty("key");
      expect(cat).toHaveProperty("name");
      expect(cat).toHaveProperty("count");
      expect(typeof cat.count).toBe("number");
    }
  });
});
