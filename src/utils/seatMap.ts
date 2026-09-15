import type { AirlineCabinLayout, SeatCell, SeatClass, SeatSelection } from '@/types';

const COLUMNS_3_3 = ['A', 'B', 'C', '', 'D', 'E', 'F'] as const;

/** Deterministic occupancy pattern for cabin layout previews. */
function isOccupied(seatId: string): boolean {
  let hash = 0;
  for (let i = 0; i < seatId.length; i += 1) {
    hash = (hash * 31 + seatId.charCodeAt(i)) % 100;
  }
  return hash < 28;
}

function seatPrice(seatClass: SeatClass): number {
  if (seatClass === 'first') return 89;
  if (seatClass === 'premium') return 42;
  return 0;
}

function buildRow(
  row: number,
  seatClass: SeatClass,
  totalRows: number,
  occupiedOverride?: Set<string>,
): SeatCell[] {
  const cells: SeatCell[] = [];
  const depth = row / totalRows;

  for (const col of COLUMNS_3_3) {
    if (col === '') {
      cells.push({
        id: `aisle-${row}`,
        row,
        column: '',
        seatClass,
        status: 'occupied',
        price: 0,
        depth,
      });
      continue;
    }

    const id = `${row}${col}`;
    const occupied = occupiedOverride?.has(id) ?? isOccupied(id);
    cells.push({
      id,
      row,
      column: col,
      seatClass,
      status: occupied ? 'occupied' : 'available',
      price: seatPrice(seatClass),
      depth,
    });
  }

  return cells;
}

export function buildNarrowBodyCabin(airline: string): SeatCell[] {
  const seats: SeatCell[] = [];
  const firstRows = [1, 2];
  const premiumRows = [3, 4, 5];
  const economyStart = 6;
  const economyEnd = 28;
  const totalRows = economyEnd;

  for (const row of firstRows) {
    seats.push(...buildRow(row, 'first', totalRows));
  }
  for (const row of premiumRows) {
    seats.push(...buildRow(row, 'premium', totalRows));
  }
  for (let row = economyStart; row <= economyEnd; row += 1) {
    seats.push(...buildRow(row, 'economy', totalRows));
  }

  // Block exit rows for realism
  const exitRow = 12;
  for (const col of ['A', 'B', 'C', 'D', 'E', 'F']) {
    const id = `${exitRow}${col}`;
    const cell = seats.find((s) => s.id === id);
    if (cell) cell.status = 'occupied';
  }

  void airline;
  return seats;
}

/** Southwest-style open seating — pick a boarding zone group. */
export function buildSouthwestZones(): SeatCell[] {
  const zones: Array<{ id: string; row: number; label: string; price: number }> = [
    { id: 'zone-a', row: 1, label: 'Group A — first 15', price: 15 },
    { id: 'zone-b', row: 2, label: 'Group B — rows 16–30', price: 0 },
    { id: 'zone-c', row: 3, label: 'Group C — back of plane', price: 0 },
  ];

  return zones.flatMap((zone) =>
    ['A', 'B', 'C', 'D', 'E', 'F'].map((col, index) => ({
      id: `${zone.id}-${col}`,
      row: zone.row,
      column: col,
      seatClass: 'economy',
      status: isOccupied(`${zone.id}-${col}`) ? ('occupied' as const) : ('available' as const),
      price: zone.price + (index === 0 ? 5 : 0),
      depth: zone.row / 3,
    })),
  );
}

export function buildSeatMap(airline: string, layout: AirlineCabinLayout): SeatCell[] {
  if (layout === 'southwest-open') {
    return buildSouthwestZones();
  }
  return buildNarrowBodyCabin(airline);
}

export function toSeatSelection(flightId: string, seat: SeatCell): SeatSelection {
  const label = seat.id.startsWith('zone-')
    ? seat.id.replace('-', ' ').toUpperCase()
    : `${seat.row}${seat.column}`;

  return {
    flightId,
    seatId: seat.id,
    row: seat.row,
    column: seat.column,
    seatClass: seat.seatClass,
    price: seat.price,
    label,
  };
}

export function applySeatSelection(seats: SeatCell[], selectedId: string | null): SeatCell[] {
  return seats.map((seat) => {
    if (seat.column === '' || seat.status === 'occupied') return seat;
    if (seat.id === selectedId) return { ...seat, status: 'selected' };
    if (seat.status === 'selected') return { ...seat, status: 'available' };
    return seat;
  });
}
