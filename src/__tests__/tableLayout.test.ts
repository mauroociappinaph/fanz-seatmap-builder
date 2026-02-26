import { Table } from "../domain/types";
import { calculateTableSeatPositions } from "../services/layout/tableLayout";

describe("tableLayout Service", () => {
  it("should distribute seats around a circular table", () => {
    const table: Partial<Table> = {
      id: "table-1",
      shape: "round",
      width: 100, // diameter
      seats: Array(4).fill({}),
    };

    const positionedSeats = calculateTableSeatPositions(table as Table);

    expect(positionedSeats).toHaveLength(4);

    // Seat 0 should be at radius offset (e.g., x=50, y=0 or similar)
    // Most importantly, they shouldn't all be at 0,0
    const allAtZero = positionedSeats.every((s) => s.cx === 0 && s.cy === 0);
    expect(allAtZero).toBe(false);

    // Check symmetry (roughly)
    expect(positionedSeats[0].cx).toBeCloseTo(50 + 15); // radius + offset
    expect(positionedSeats[2].cx).toBeCloseTo(-(50 + 15));
  });

  it("should distribute seats around a rectangular table", () => {
    const table: Partial<Table> = {
      id: "table-2",
      shape: "rectangular",
      width: 100,
      height: 60,
      seats: Array(4).fill({}),
    };

    const positionedSeats = calculateTableSeatPositions(table as Table);

    expect(positionedSeats).toHaveLength(4);
    const allAtZero = positionedSeats.every((s) => s.cx === 0 && s.cy === 0);
    expect(allAtZero).toBe(false);
  });
});
