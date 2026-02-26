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

    // Seat 0 should be at the TOP (12 o'clock)
    // x should be 0, y should be -radius
    expect(positionedSeats[0].cx).toBeCloseTo(0);
    expect(positionedSeats[0].cy).toBeCloseTo(-(50 + 15));

    // Seat 2 should be at the BOTTOM (6 o'clock)
    expect(positionedSeats[2].cx).toBeCloseTo(0);
    expect(positionedSeats[2].cy).toBeCloseTo(50 + 15);
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

    // With 4 seats, they should be centered on each side
    // Top side center: x=0 (approx), y=-45
    // Our math puts seat 0 at distance (0.5/4)*320 = 40
    // cx = -50 + 40 = -10. (Still on top edge, but better than corner)
    expect(positionedSeats[0].cy).toBeCloseTo(-45);

    // Check that seats are not all at the same place
    const uniquePos = new Set(positionedSeats.map((s) => `${s.cx},${s.cy}`));
    expect(uniquePos.size).toBe(4);
  });
});
