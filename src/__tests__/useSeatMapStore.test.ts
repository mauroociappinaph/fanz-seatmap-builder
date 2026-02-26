// src/__tests__/useSeatMapStore.test.ts
import { useSeatMapStore } from "@/store/useSeatMapStore";
import { Row } from "@/domain/types";

describe("useSeatMapStore", () => {
  beforeEach(() => {
    useSeatMapStore.getState().newMap();
  });

  it("should initialize with an empty seat map", () => {
    const { seatMap } = useSeatMapStore.getState();
    expect(seatMap.elements).toHaveLength(0);
    expect(seatMap.viewport.zoom).toBe(1);
  });

  it("should add an element", () => {
    const newRow: Row = {
      id: "row-1",
      type: "row",
      label: "Row A",
      position: { x: 100, y: 100 },
      rotation: 0,
      seats: [],
      seatSpacing: 10,
      seatCount: 0,
    };

    useSeatMapStore.getState().addElement(newRow);
    const { seatMap } = useSeatMapStore.getState();
    expect(seatMap.elements).toHaveLength(1);
    expect(seatMap.elements[0].id).toBe("row-1");
  });

  it("should remove an element", () => {
    const newRow: Row = {
      id: "row-1",
      type: "row",
      label: "Row A",
      position: { x: 100, y: 100 },
      rotation: 0,
      seats: [],
      seatSpacing: 10,
      seatCount: 0,
    };

    useSeatMapStore.getState().addElement(newRow);
    useSeatMapStore.getState().removeElements(["row-1"]);
    const { seatMap } = useSeatMapStore.getState();
    expect(seatMap.elements).toHaveLength(0);
  });

  it("should update an element", () => {
    const newRow: Row = {
      id: "row-1",
      type: "row",
      label: "Row A",
      position: { x: 100, y: 100 },
      rotation: 0,
      seats: [],
      seatSpacing: 10,
      seatCount: 0,
    };

    useSeatMapStore.getState().addElement(newRow);
    useSeatMapStore.getState().updateElement("row-1", { label: "Updated Row" });
    const { seatMap } = useSeatMapStore.getState();
    expect((seatMap.elements[0] as Row).label).toBe("Updated Row");
  });

  it("should ensure unique IDs when adding elements", () => {
    const row1: Row = {
      id: "duplicate-id",
      type: "row",
      label: "Row 1",
      position: { x: 0, y: 0 },
      rotation: 0,
      seats: [],
      seatSpacing: 10,
      seatCount: 0,
    };
    const row2: Row = {
      id: "duplicate-id",
      type: "row",
      label: "Row 2",
      position: { x: 50, y: 50 },
      rotation: 0,
      seats: [],
      seatSpacing: 10,
      seatCount: 0,
    };

    useSeatMapStore.getState().addElement(row1);
    useSeatMapStore.getState().addElement(row2);

    const { seatMap } = useSeatMapStore.getState();
    expect(seatMap.elements).toHaveLength(2);
    expect(seatMap.elements[0].id).toBe("duplicate-id");
    expect(seatMap.elements[1].id).not.toBe("duplicate-id");
    expect(seatMap.elements[1].id).toContain("row-");
  });

  it("should toggle selection", () => {
    useSeatMapStore.getState().toggleSelection("element-1");
    expect(useSeatMapStore.getState().selectedIds).toContain("element-1");

    useSeatMapStore.getState().toggleSelection("element-1");
    expect(useSeatMapStore.getState().selectedIds).not.toContain("element-1");
  });

  it("should apply bulk labels to selected elements", () => {
    const row1: Row = {
      id: "row-1",
      type: "row",
      label: "Old Label 1",
      position: { x: 0, y: 0 },
      rotation: 0,
      seats: [],
      seatSpacing: 0,
      seatCount: 0,
    };
    const row2: Row = {
      id: "row-2",
      type: "row",
      label: "Old Label 2",
      position: { x: 0, y: 0 },
      rotation: 0,
      seats: [],
      seatSpacing: 0,
      seatCount: 0,
    };

    useSeatMapStore.getState().addElement(row1);
    useSeatMapStore.getState().addElement(row2);
    useSeatMapStore.getState().setSelection(["row-1", "row-2"]);

    useSeatMapStore.getState().applyBulkLabels("Sector-{A..B}");

    const { seatMap } = useSeatMapStore.getState();
    expect(seatMap.elements.find((el) => el.id === "row-1")?.label).toBe(
      "Sector-A",
    );
    expect(seatMap.elements.find((el) => el.id === "row-2")?.label).toBe(
      "Sector-B",
    );
  });

  it("should clear draggingId if the element is removed", () => {
    const rowId = "row-to-drag";
    const newRow: Row = {
      id: rowId,
      type: "row",
      label: "Row A",
      position: { x: 100, y: 100 },
      rotation: 0,
      seats: [],
      seatSpacing: 10,
      seatCount: 0,
    };

    useSeatMapStore.getState().addElement(newRow);
    useSeatMapStore.getState().startDragging(rowId, { x: 0, y: 0 });

    expect(useSeatMapStore.getState().draggingId).toBe(rowId);

    useSeatMapStore.getState().removeElements([rowId]);

    expect(useSeatMapStore.getState().draggingId).toBeNull();
    expect(useSeatMapStore.getState().lastMousePosition).toBeNull();
  });

  it("should enforce maximum label lengths", () => {
    const rowId = "test-row";
    const longLabel = "A".repeat(100);

    const newRow: Row = {
      id: rowId,
      type: "row",
      label: "Initial",
      position: { x: 0, y: 0 },
      rotation: 0,
      seats: [
        {
          id: "s1",
          type: "seat",
          label: "1",
          cx: 0,
          cy: 0,
          status: "available",
        },
      ],
      seatSpacing: 10,
      seatCount: 1,
    };

    useSeatMapStore.getState().addElement(newRow);

    // Test truncation for Row label (limit 50)
    useSeatMapStore.getState().updateElement(rowId, { label: longLabel });
    let updatedRow = useSeatMapStore
      .getState()
      .seatMap.elements.find((el) => el.id === rowId) as Row;
    expect(updatedRow.label.length).toBe(50);

    // Test truncation for Seat label (limit 10)
    useSeatMapStore.getState().updateElement("s1", { label: longLabel });
    updatedRow = useSeatMapStore
      .getState()
      .seatMap.elements.find((el) => el.id === rowId) as Row;
    expect(updatedRow.seats[0].label.length).toBe(10);
  });
});
