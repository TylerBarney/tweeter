// AI-assisted: see AI-ATTRIBUTION.md

export function lazy<T>(create: () => T): () => T {
  let value: T | undefined;
  return () => {
    if (value === undefined) {
      value = create();
    }

    return value;
  };
}
