// src/__tests__/jsonMapper.test.ts
import { SeatMapRepository } from "@/services";
import { SeatMap, Row } from "@/domain";

describe("jsonMapper", () => {
  const mockSeatMap: SeatMap = {
    id: "test-map",
    name: "Test Map",
    elements: [
      {
        id: "row-1",
        type: "row",
        label: "Row A",
        position: { x: 10, y: 10 },
        rotation: 0,
        seats: [
          {
            id: "seat-1",
            type: "seat",
            label: "A1",
            status: "available",
            cx: 0,
            cy: 0,
          },
        ],
        seatSpacing: 5,
        seatCount: 1,
      } as Row,
    ],
    viewport: { zoom: 1, panX: 0, panY: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("should export a seat map to JSON string", () => {
    const json = SeatMapRepository.serialize(mockSeatMap);
    expect(typeof json).toBe("string");
    expect(json).toContain("test-map");
  });

  it("should import a seat map from a valid JSON string", () => {
    const json = SeatMapRepository.serialize(mockSeatMap);
    const imported = SeatMapRepository.deserialize(json);
    // Elements should match (with potential labels normalized)
    expect(imported.id).toBe(mockSeatMap.id);
    expect(imported.elements).toHaveLength(mockSeatMap.elements.length);
  });

  it("should throw an error when importing an invalid JSON string", () => {
    const invalidJSON = '{"id": "test"}'; // Missing required fields
    expect(() => SeatMapRepository.deserialize(invalidJSON)).toThrow();
  });
});
