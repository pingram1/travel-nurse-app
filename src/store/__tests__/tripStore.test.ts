import { CRIME_INDEX_SAFE_LIMIT, selectTripData, useTripStore } from '../tripStore';

function tripSlice(overrides: Partial<ReturnType<typeof useTripStore.getState>> = {}) {
  const base = useTripStore.getState();
  return {
    selectedHospitalId: base.selectedHospitalId,
    selectedLodgingId: base.selectedLodgingId,
    selectedFlightId: base.selectedFlightId,
    selectedSeat: base.selectedSeat,
    selectedRestaurantIds: base.selectedRestaurantIds,
    selectedTransitId: base.selectedTransitId,
    selectedCarRentalId: base.selectedCarRentalId,
    housingFirstEnabled: base.housingFirstEnabled,
    contractStart: base.contractStart,
    contractEnd: base.contractEnd,
    ...overrides,
  };
}

describe('tripStore', () => {
  beforeEach(() => {
    useTripStore.getState().reset();
  });

  it('selecting a hospital resets lodging, flight, and seat selections', () => {
    const store = useTripStore.getState();
    store.selectHospital('mercy-portland');
    useTripStore.getState().selectLodging('pdx-l1');
    useTripStore.getState().selectFlight('f-pdx-1');
    useTripStore.getState().selectSeat({
      flightId: 'f-pdx-1',
      seatId: '8A',
      row: 8,
      column: 'A',
      seatClass: 'economy',
      price: 0,
      label: '8A',
    });

    useTripStore.getState().selectHospital('stlukes-houston');

    const state = useTripStore.getState();
    expect(state.selectedHospitalId).toBe('stlukes-houston');
    expect(state.selectedLodgingId).toBeNull();
    expect(state.selectedFlightId).toBeNull();
    expect(state.selectedSeat).toBeNull();
  });

  it('derives safety rating and scoped lodging/flights from the selected hospital', () => {
    const data = selectTripData(tripSlice({ selectedHospitalId: 'mercy-portland' }), 110);

    expect(data.safety?.facilityName).toBe('Mercy General Hospital');
    expect(data.lodging.every((l) => l.hospitalId === 'mercy-portland')).toBe(true);
    expect(data.flights.every((f) => f.hospitalId === 'mercy-portland')).toBe(true);
  });

  it('recommends only lodging within crime limit and stipend budget', () => {
    const data = selectTripData(tripSlice({ selectedHospitalId: 'stlukes-houston' }), 110);

    for (const listing of data.recommendedLodging) {
      expect(listing.areaCrimeIndex).toBeLessThanOrEqual(CRIME_INDEX_SAFE_LIMIT);
      expect(listing.nightlyRate).toBeLessThanOrEqual(110);
    }
    // Marriott ($129) exceeds budget; Midtown Budget Suites has crime index 62.
    expect(data.flaggedLodging.map((l) => l.id)).toEqual(
      expect.arrayContaining(['iah-l1', 'iah-l3']),
    );
  });

  it('builds itinerary summary from trip selections', () => {
    useTripStore.getState().selectHospital('mercy-portland');
    useTripStore.getState().selectLodging('pdx-l1');
    useTripStore.getState().selectFlight('f-pdx-1');
    useTripStore.getState().selectTransit('transit-uber');
    useTripStore.getState().selectCarRental('car-pdx-turo');

    const state = useTripStore.getState();
    const data = selectTripData(
      tripSlice({
        selectedHospitalId: state.selectedHospitalId,
        selectedLodgingId: state.selectedLodgingId,
        selectedFlightId: state.selectedFlightId,
        selectedSeat: state.selectedSeat,
        selectedRestaurantIds: state.selectedRestaurantIds,
        selectedTransitId: state.selectedTransitId,
        selectedCarRentalId: state.selectedCarRentalId,
      }),
      110,
    );

    expect(data.itinerary.lodging?.name).toBe('Riverside Extended Stay');
    expect(data.itinerary.groundTransit?.provider).toBe('uber');
    expect(data.itinerary.carRental?.provider).toBe('turo');
    expect(data.itinerary.estimatedTotal).toBeGreaterThan(0);
  });
});
