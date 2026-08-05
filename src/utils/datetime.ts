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
