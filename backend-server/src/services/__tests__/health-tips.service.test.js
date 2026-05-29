import { describe, it, expect } from "vitest";
import {
  getAllTips,
  getRandomTips,
  getCategories,
  isValidCategory,
} from "../health-tips.service.js";
import { healthTips } from "../../data/health-tips.data.js";

/**
 * Unit tests for health-tips.service.js
 * Validates: Requirements 2.2, 2.3, 3.1, 3.3, 5.1, 5.2
 */

describe("health-tips.service", () => {
  describe("getAllTips()", () => {
    it("should return all tips when called without options", () => {
      const result = getAllTips();
      expect(result).toHaveLength(healthTips.length);
      expect(result).toEqual(healthTips);
    });

    it("should return only sleep tips when filtered by category sleep", () => {
      const result = getAllTips({ category: "sleep" });
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((tip) => tip.category === "sleep")).toBe(true);
    });

    it("should return empty array for category with no tips", () => {
      const result = getAllTips({ category: "nonexistent" });
      expect(result).toEqual([]);
    });
  });

  describe("getRandomTips()", () => {
    it("should return exactly 3 unique tips when count is 3", () => {
      const result = getRandomTips({ count: 3 });
      expect(result).toHaveLength(3);

      const ids = result.map((tip) => tip.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it("should return all tips when count exceeds total available", () => {
      const result = getRandomTips({ count: healthTips.length + 100 });
      expect(result).toHaveLength(healthTips.length);
    });

    it("should return 1 tip by default when count is not specified", () => {
      const result = getRandomTips();
      expect(result).toHaveLength(1);
    });
  });

  describe("getCategories()", () => {
    it("should return exactly 6 categories", () => {
      const result = getCategories();
      expect(result).toHaveLength(6);
    });

    it("should include all expected category keys", () => {
      const result = getCategories();
      const keys = result.map((c) => c.key);
      expect(keys).toEqual(
        expect.arrayContaining([
          "sleep",
          "heart",
          "nutrition",
          "exercise",
          "stress",
          "general",
        ])
      );
    });

    it("should have accurate count for each category", () => {
      const result = getCategories();
      for (const cat of result) {
        const expected = healthTips.filter(
          (tip) => tip.category === cat.key
        ).length;
        expect(cat.count).toBe(expected);
      }
    });

    it("should include Vietnamese name for each category", () => {
      const result = getCategories();
      for (const cat of result) {
        expect(cat.name).toBeDefined();
        expect(typeof cat.name).toBe("string");
        expect(cat.name.length).toBeGreaterThan(0);
      }
    });
  });

  describe("isValidCategory()", () => {
    it("should return true for valid categories", () => {
      const validCategories = [
        "sleep",
        "heart",
        "nutrition",
        "exercise",
        "stress",
        "general",
      ];
      for (const cat of validCategories) {
        expect(isValidCategory(cat)).toBe(true);
      }
    });

    it("should return false for invalid categories", () => {
      expect(isValidCategory("invalid")).toBe(false);
      expect(isValidCategory("")).toBe(false);
      expect(isValidCategory("SLEEP")).toBe(false);
    });
  });
});
