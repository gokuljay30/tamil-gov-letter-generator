export function inclusiveDateCount(fromDate: string, toDate: string): string | null {
  const pattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const from = pattern.exec(fromDate);
  const to = pattern.exec(toDate);
  if (!from || !to) return null;

  const fromTime = Date.UTC(Number(from[1]), Number(from[2]) - 1, Number(from[3]));
  const toTime = Date.UTC(Number(to[1]), Number(to[2]) - 1, Number(to[3]));
  if (!Number.isFinite(fromTime) || !Number.isFinite(toTime) || toTime < fromTime) return null;

  return String(Math.floor((toTime - fromTime) / 86_400_000) + 1);
}
