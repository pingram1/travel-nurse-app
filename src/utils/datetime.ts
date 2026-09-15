const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function formatTime(iso: string): string {
  const date = new Date(iso);
  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const meridiem = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${meridiem}`;
}

export function formatShortDate(iso: string): string {
  return iso.slice(0, 10);
}

function utcCalendarMs(isoDate: string): number {
  return Date.UTC(
    Number(isoDate.slice(0, 4)),
    Number(isoDate.slice(5, 7)) - 1,
    Number(isoDate.slice(8, 10)),
  );
}

/** Whole lodging nights between UTC calendar dates (checkout on the end date). */
export function countLodgingNights(startIso: string | null, endIso: string | null): number {
  if (!startIso || !endIso) return 0;
  const start = startIso.slice(0, 10);
  const end = endIso.slice(0, 10);
  if (!ISO_DATE.test(start) || !ISO_DATE.test(end)) return 0;

  const days = Math.round((utcCalendarMs(end) - utcCalendarMs(start)) / MS_PER_DAY);
  if (days < 0) return 0;
  return Math.max(1, days);
}
