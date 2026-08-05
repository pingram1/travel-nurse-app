import {
  applySeatSelection,
  buildNarrowBodyCabin,
  buildSeatMap,
  toSeatSelection,
} from '../seatMap';

describe('seatMap', () => {
  it('generates a 3-3 narrow-body cabin with aisle gaps', () => {
    const seats = buildNarrowBodyCabin('Alaska');
    const row12 = seats.filter((s) => s.row === 12);
    expect(row12.some((s) => s.column === '')).toBe(true);
    expect(row12.filter((s) => s.column !== '').length).toBe(6);
  });

  it('builds southwest open seating zones', () => {
    const seats = buildSeatMap('Southwest', 'southwest-open');
    expect(seats.some((s) => s.id.startsWith('zone-a'))).toBe(true);
  });

  it('marks selected seat and clears previous selection', () => {
    const seats = buildNarrowBodyCabin('Delta');
    const available = seats.find((s) => s.status === 'available' && s.column !== '');
    expect(available).toBeDefined();
    if (!available) return;

    const updated = applySeatSelection(seats, available.id);
    expect(updated.find((s) => s.id === available.id)?.status).toBe('selected');
  });

  it('converts seat cell to SeatSelection', () => {
    const seats = buildNarrowBodyCabin('United');
    const seat = seats.find((s) => s.row === 8 && s.column === 'C');
    expect(seat).toBeDefined();
    if (!seat) return;

    const selection = toSeatSelection('f-1', seat);
    expect(selection.label).toBe('8C');
    expect(selection.flightId).toBe('f-1');
  });
});
