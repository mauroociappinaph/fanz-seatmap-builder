// src/services/persistence/seatMapRepository.ts
import { SeatMap } from "@/domain/types";
import { validateSeatMap } from "./jsonMapper";

export interface ISeatMapRepository {
  save(seatMap: SeatMap): void;
  load(): SeatMap | null;
  serialize(seatMap: SeatMap): string;
  deserialize(json: string): SeatMap;
}

/**
 * Repository implementation for managing SeatMap persistence.
 * This encapsulates Zod validation and JSON handling.
 */
export const SeatMapRepository: ISeatMapRepository = {
  /**
   * Serializes a SeatMap object to a formatted JSON string.
   */
  serialize(seatMap: SeatMap): string {
    return JSON.stringify(seatMap, null, 2);
  },

  /**
   * Deserializes and validates a JSON string into a SeatMap object.
   * Throws if validation fails.
   */
  deserialize(json: string): SeatMap {
    try {
      const data = JSON.parse(json);
      return validateSeatMap(data);
    } catch (error) {
      console.error("Repository: Failed to deserialize SeatMap", error);
      throw error;
    }
  },

  /**
   * Saves the seat map to browser storage (optional helper).
   * Note: Zustand 'persist' handles this automatically for the state,
   * but this method is available for manual snapshots.
   */
  save(seatMap: SeatMap): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("fanz-seatmap-snapshot", this.serialize(seatMap));
    }
  },

  /**
   * Loads a seat map from browser storage.
   */
  load(): SeatMap | null {
    if (typeof window === "undefined") return null;
    const json = localStorage.getItem("fanz-seatmap-snapshot");
    if (!json) return null;
    return this.deserialize(json);
  },
};
