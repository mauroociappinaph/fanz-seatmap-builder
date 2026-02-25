// src/services/persistence/jsonMapper.ts
import { z } from "zod";
import { SeatMap } from "@/domain/types";

const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const SeatSchema = z.object({
  id: z.string(),
  type: z.literal("seat"),
  label: z.string(),
  status: z.enum(["available", "selected", "blocked"]),
  cx: z.number(),
  cy: z.number(),
});

const RowSchema = z.object({
  id: z.string(),
  type: z.literal("row"),
  label: z.string(),
  position: PositionSchema,
  rotation: z.number(),
  seats: z.array(SeatSchema),
  seatSpacing: z.number(),
});

const AreaSchema = z.object({
  id: z.string(),
  type: z.literal("area"),
  label: z.string(),
  path: z.string(),
  position: PositionSchema,
});

const TableSchema = z.object({
  id: z.string(),
  type: z.literal("table"),
  label: z.string(),
  position: PositionSchema,
  shape: z.enum(["round", "rectangular"]),
  seats: z.array(SeatSchema),
  radius: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const MapElementSchema = z.discriminatedUnion("type", [
  RowSchema,
  AreaSchema,
  TableSchema,
]);

const SeatMapSchema = z.object({
  id: z.string(),
  name: z.string(),
  elements: z.array(MapElementSchema),
  viewport: z.object({
    zoom: z.number(),
    panX: z.number(),
    panY: z.number(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const validateSeatMap = (data: unknown): SeatMap => {
  return SeatMapSchema.parse(data) as SeatMap;
};

export const exportSeatMapToJSON = (seatMap: SeatMap): string => {
  return JSON.stringify(seatMap, null, 2);
};

export const importSeatMapFromJSON = (json: string): SeatMap => {
  const data = JSON.parse(json);
  return validateSeatMap(data);
};
