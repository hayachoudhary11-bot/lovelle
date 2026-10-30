export type StrokePayload = { points: { x: number; y: number }[]; color: string; strokeWidth: number };
export function isStrokePayload(payload: unknown): payload is StrokePayload {
  if (!payload || typeof payload !== "object") return false;
  const stroke = payload as Partial<StrokePayload>;
  return Array.isArray(stroke.points) && stroke.points.length > 0 && stroke.points.length <= 5000 &&
    stroke.points.every((point) => point && Number.isFinite(point.x) && Number.isFinite(point.y) && Math.abs(point.x) <= 10000 && Math.abs(point.y) <= 10000) &&
    typeof stroke.color === "string" && /^#[\da-f]{3,8}$/i.test(stroke.color) &&
    typeof stroke.strokeWidth === "number" && Number.isFinite(stroke.strokeWidth) && stroke.strokeWidth > 0 && stroke.strokeWidth <= 100;
}
