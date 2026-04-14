export const GRAB_DISTANCE_BIAS = 0.15;
export const GRAB_MIN_DISTANCE = 0.6;
export const GRAB_MAX_DISTANCE = 3.5;
export const GRAB_HOLD_DISTANCE = 3;

export function resolveGrabDistance(distance: number) {
  const adjustedDistance = distance - GRAB_DISTANCE_BIAS;
  return Math.min(GRAB_MAX_DISTANCE, Math.max(GRAB_HOLD_DISTANCE, adjustedDistance));
}

export function canGrabAtDistance(distance: number) {
  const adjustedDistance = distance - GRAB_DISTANCE_BIAS;
  return adjustedDistance >= GRAB_MIN_DISTANCE && adjustedDistance <= GRAB_MAX_DISTANCE;
}