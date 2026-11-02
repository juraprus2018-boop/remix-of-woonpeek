export interface RentPoint { month: string; avg: number | null; median: number | null; sample: number }
export const hasRentSample = (sample: number | null | undefined) => Number.isFinite(sample) && Number(sample) > 0;
export const usableRentPoints = (points: RentPoint[]) => points.filter(point => hasRentSample(point.sample)).map(point => ({
  ...point,
  avg: point.avg !== null && Number.isFinite(point.avg) && point.avg > 0 ? point.avg : null,
  median: point.median !== null && Number.isFinite(point.median) && point.median > 0 ? point.median : null,
}));