// src/services/persistence/seatMapRepository.ts
import { SeatMap } from "@/domain";
import { validateSeatMap } from "./jsonMapper";
import { MapService } from "../mapService";

export interface ISeatMapRepository {
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
   * Includes a final cleanup phase to ensure data integrity.
   */
  serialize(seatMap: SeatMap): string {
    const cleanData = MapService.cleanMapData(seatMap);
    return JSON.stringify(cleanData, null, 2);
  },

  /**
   * Deserializes and validates a JSON string into a SeatMap object.
   * Throws if validation fails.
   */
  deserialize(json: string): SeatMap {
    try {
      const data = JSON.parse(json);
      const validated = validateSeatMap(data);
      // Clean data upon import as well to handle legacy bad files
      return MapService.cleanMapData(validated);
    } catch (error) {
      console.error("Repository: Failed to deserialize SeatMap", error);
      throw error;
    }
  },
};
