import {
  annotateLodgingOptions,
  classifyLodgingVariance,
  filterLodgingByStipend,
} from '../stipend';

describe('stipend utils', () => {
  it('classifies under, at, and over stipend variance', () => {
    expect(classifyLodgingVariance(90, 100)).toEqual({ variance: 'under', varianceAmount: -10 });
    expect(classifyLodgingVariance(100, 100)).toEqual({ variance: 'at', varianceAmount: 0 });
    expect(classifyLodgingVariance(110, 100)).toEqual({ variance: 'over', varianceAmount: 10 });
  });

  it('filters out lodging options over the stipend limit', () => {
    const options = annotateLodgingOptions(
      [
        { id: '1', name: 'A', provider: 'hotel', nightlyRate: 90 },
        { id: '2', name: 'B', provider: 'airbnb', nightlyRate: 120 },
      ],
      100,
    );

    expect(filterLodgingByStipend(options)).toHaveLength(1);
  });
});
