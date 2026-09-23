import { decimalTransformer } from './decimal.transformer';

describe('decimalTransformer', () => {
  it('converts numeric strings to numbers on read', () => {
    expect(decimalTransformer.from('20.41')).toBe(20.41);
    expect(decimalTransformer.from('72.00')).toBe(72);
  });

  it('keeps null/undefined as null on read', () => {
    expect(decimalTransformer.from(null)).toBeNull();
    expect(decimalTransformer.from(undefined)).toBeNull();
  });

  it('passes values through unchanged on write', () => {
    expect(decimalTransformer.to(20.41)).toBe(20.41);
    expect(decimalTransformer.to(null)).toBeNull();
  });
});
