// src/__tests__/patternParser.test.ts
import { parsePattern } from "@/services/labeling/patternParser";

describe("patternParser", () => {
  describe("Numeric ranges: A{1..3}", () => {
    it("should generate numeric sequences correcty", () => {
      expect(parsePattern("A{1..3}")).toEqual(["A1", "A2", "A3"]);
    });

    it("should handle different prefixes", () => {
      expect(parsePattern("Seat-{10..12}")).toEqual([
        "Seat-10",
        "Seat-11",
        "Seat-12",
      ]);
    });
  });

  describe("Alphabetic ranges: {A..C}1", () => {
    it("should generate alphabetic sequences correctly", () => {
      expect(parsePattern("{A..C}1")).toEqual(["A1", "B1", "C1"]);
    });
  });

  describe("Nested/Multiple patterns (Advanced): {A..B}{1..2}", () => {
    it("should generate cartesian product for multiple patterns", () => {
      expect(parsePattern("{A..B}{1..2}")).toEqual(["A1", "A2", "B1", "B2"]);
    });
  });

  describe("Plain text: Sector-A", () => {
    it("should return the text as a single element array if no pattern found", () => {
      expect(parsePattern("Sector-A")).toEqual(["Sector-A"]);
    });
  });

  describe("Error handling", () => {
    it("should handle empty or invalid bracket content gracefully", () => {
      expect(parsePattern("A{}")).toEqual(["A{}"]);
      expect(parsePattern("A{1..}")).toEqual(["A{1..}"]);
    });
  });
});
