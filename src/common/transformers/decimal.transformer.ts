import { ValueTransformer } from 'typeorm';

/**
 * Postgres numeric/decimal columns are returned by the pg driver as strings to
 * avoid precision loss. This transformer converts them back to JS numbers on
 * read and passes values through unchanged on write. Null-safe.
 */
export const decimalTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | number | null | undefined): number | null => {
    if (value === null || value === undefined) {
      return null;
    }
    const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  },
};
