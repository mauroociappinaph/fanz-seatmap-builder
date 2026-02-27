// src/services/persistence/jsonMapper.ts
import { z } from "zod";
import { SeatMap } from "@/domain";

const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const SeatSchema = z.object({
  id: z.string().min(1),
  type: z.literal("seat"),
  label: z.string().min(1).max(10),
  status: z.enum(["available", "selected", "blocked", "occupied"]),
  cx: z.number(),
  cy: z.number(),
});

const RowSchema = z.object({
  id: z.string().min(1),
  type: z.literal("row"),
  label: z.string().min(1).max(50),
  position: PositionSchema,
  rotation: z.number(),
  seats: z.array(SeatSchema),
  seatSpacing: z.number(),
  seatCount: z.number().min(1),
});

const AreaSchema = z.object({
  id: z.string().min(1),
  type: z.literal("area"),
  label: z.string().min(1).max(50),
  points: z.array(PositionSchema).min(3),
  color: z.string().optional(),
});

const TableSchema = z.object({
  id: z.string().min(1),
  type: z.literal("table"),
  label: z.string().min(1).max(50),
  position: PositionSchema,
  rotation: z.number(),
  shape: z.enum(["round", "rectangular"]),
  seats: z.array(SeatSchema),
  width: z.number().positive(),
  height: z.number().positive(),
  capacity: z.number().min(1),
});

const MapElementSchema = z.discriminatedUnion("type", [
  RowSchema,
  AreaSchema,
  TableSchema,
]);

const SeatMapSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  elements: z.array(MapElementSchema).max(5000), // Performance safety limit
  viewport: z.object({
    zoom: z.number().positive(),
    panX: z.number(),
    panY: z.number(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const validateSeatMap = (data: unknown): SeatMap => {
  return SeatMapSchema.parse(data) as SeatMap;
};
