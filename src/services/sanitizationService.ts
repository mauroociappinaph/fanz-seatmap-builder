// src/services/sanitizationService.ts
import { MapElement, MAX_LABEL_LENGTHS } from "@/domain";

export const SanitizationService = {
  /**
   * Sanitizes and applies a new label based on element type.
   * Removes control characters and limits length.
   */
  sanitizeLabel: (label: string, type: MapElement["type"] | "seat"): string => {
    const limit = MAX_LABEL_LENGTHS[type];

    // Remove control characters, non-printable ASCII and potentially dangerous symbols
    const cleanLabel = label
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Remove control chars
      .trim()
      .replace(/^[,.\s]+/, "")
      .replace(/[,.\s]+$/, "");

    return cleanLabel.slice(0, limit);
  },
};
