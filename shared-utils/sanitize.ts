// String sanitizer
export function sanitizeEnvString(
  name: string,
  value: string | undefined
): string {
  if (!value || typeof value !== "string") {
    throw new Error(`Missing or invalid environment variable: ${name}`);
  }

  const trimmed = value.trim();

  if (!/^[\w-]+$/.test(trimmed)) {
    throw new Error(
      `Invalid characters in ${name}. Only alphanumeric, _, and - allowed.`
    );
  }

  return trimmed;
}

// Validarea array-urilor
export function sanitizeEnvList(
  name: string,
  value: string | undefined,
  expectedLength: number,
  options: { type?: "string" | "number" } = {}
): string[] | number[] {
  if (!value) {
    throw new Error(`Missing env variable: ${name}`);
  }

  const list = value.split(",").map((v) => v.trim());

  if (list.length !== expectedLength) {
    throw new Error(`${name} must have exactly ${expectedLength} items.`);
  }

  if (options.type === "number") {
    const nums = list.map((v) => {
      const n = Number(v);
      if (isNaN(n) || n < 0) {
        throw new Error(`Invalid number in ${name}: "${v}"`);
      }
      return n;
    });
    return nums;
  }

  for (const item of list) {
    if (!/^[\w-]+$/.test(item)) {
      throw new Error(`${name} contains invalid entry: "${item}"`);
    }
  }

  return list;
}
