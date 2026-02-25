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
    };

    useSeatMapStore.getState().addElement(newRow);
    useSeatMapStore.getState().updateElement("row-1", { label: "Updated Row" });
    const { seatMap } = useSeatMapStore.getState();
    expect((seatMap.elements[0] as Row).label).toBe("Updated Row");
  });

  it("should toggle selection", () => {
    useSeatMapStore.getState().toggleSelection("element-1");
    expect(useSeatMapStore.getState().selectedIds).toContain("element-1");

    useSeatMapStore.getState().toggleSelection("element-1");
    expect(useSeatMapStore.getState().selectedIds).not.toContain("element-1");
  });
});
