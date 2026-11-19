import { INVALID_PRESS_PENALTY, MAX_SCORE } from "../config";

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function pointsForPress(elapsed: number, duration: number): number {
  return Math.round(100 - 50 * clamp(elapsed / duration, 0, 1));
}

export function totalScore(points: number[], invalidPresses: number): number {
  return clamp(
    points.reduce((sum, value) => sum + value, 0) -
      invalidPresses * INVALID_PRESS_PENALTY,
    0,
    MAX_SCORE,
  );
}
