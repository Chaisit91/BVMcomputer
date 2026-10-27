/**
 * Thai month names with a Gregorian year, e.g. "1 ธันวาคม 2003" / "22 ต.ค. 2026".
 * Date-only values ("YYYY-MM-DD") are read as a local calendar date, so a birthday never shifts
 * by a day because of the time zone.
 */
export function formatThaiDate(value: string, month: 'long' | 'short' = 'long'): string {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('th-TH-u-ca-gregory', { day: 'numeric', month, year: 'numeric' });
}
