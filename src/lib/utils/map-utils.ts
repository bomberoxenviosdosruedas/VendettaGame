
export interface MapCoordinates {
  city: number;
  district: number;
  building: number;
}

/**
 * Calculates the distance between two points in the game universe.
 * Uses a hierarchical distance model since the exact world grid is not fully defined.
 *
 * Base Grid: 17 columns x 15 rows (255 tiles).
 * Scaling:
 * - Same District: Standard Euclidean distance on the grid.
 * - Different District: Adds a significant distance penalty per district unit.
 * - Different City: Adds a massive distance penalty per city unit.
 */
export function calculateDistance(origin: MapCoordinates, target: MapCoordinates): number {
  // Constants for scaling
  const DISTRICT_SCALE = 50; // Distance unit equivalent for 1 district step
  const CITY_SCALE = 500;    // Distance unit equivalent for 1 city step

  // Calculate grid coordinates (0-indexed)
  // Assuming building ID maps to 17x15 grid
  const GRID_WIDTH = 17;

  const originX = (origin.building - 1) % GRID_WIDTH;
  const originY = Math.floor((origin.building - 1) / GRID_WIDTH);

  const targetX = (target.building - 1) % GRID_WIDTH;
  const targetY = Math.floor((target.building - 1) / GRID_WIDTH);

  // Euclidean distance within the grid
  const gridDist = Math.sqrt(Math.pow(targetX - originX, 2) + Math.pow(targetY - originY, 2));

  // Hierarchical distance
  const cityDiff = Math.abs(target.city - origin.city);
  const districtDiff = Math.abs(target.district - origin.district);

  if (cityDiff === 0 && districtDiff === 0) {
    return Number(gridDist.toFixed(2));
  }

  // If different district or city, we abstract the distance
  // We treat the grid distance as negligible compared to inter-district travel,
  // or we add it to the center-to-center distance.
  // Simple approximation:
  const totalDist = gridDist + (districtDiff * DISTRICT_SCALE) + (cityDiff * CITY_SCALE);

  return Number(totalDist.toFixed(2));
}

/**
 * Calculates travel time in seconds.
 * @param distance Distance in game units
 * @param fleetSpeed Speed of the fleet (units per hour, or arbitrary speed metric)
 * Assuming fleetSpeed is units/hour for this calculation, but we return seconds.
 *
 * Standard formula: Time = Distance / Speed
 */
export function calculateTravelTime(distance: number, fleetSpeed: number): number {
  if (fleetSpeed <= 0) return Infinity;

  // Example: Speed is 100 => 100 units per hour
  // Time (hours) = Distance / Speed
  // Time (seconds) = (Distance / Speed) * 3600

  // However, check if legacy has specific formula.
  // Requirement says: "Retorna segundos."

  const timeInSeconds = (distance / fleetSpeed) * 3600;
  return Math.ceil(timeInSeconds);
}

/**
 * Formats seconds into HH:MM:SS string
 */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds)) return "N/A";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
