// AI-assisted: see AI-ATTRIBUTION.md

/**
 * One page of values from a data store, plus whether another page remains.
 */
export class DataPage<T> {
  readonly values: T[];
  readonly hasMorePages: boolean;

  constructor(values: T[], hasMorePages: boolean) {
    this.values = values;
    this.hasMorePages = hasMorePages;
  }
}
