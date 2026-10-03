/**
 * Compares initial and current form values, returning only modified fields.
 * Empty strings for optional fields are converted to null for FastAPI compatibility.
 */
export function diffChanges<T extends Record<string, any>>(
  initial: T,
  current: T
): Partial<T> {
  const diff: Partial<T> = {}

  for (const key of Object.keys(current) as Array<keyof T>) {
    let currentVal = current[key]
    const initialVal = initial[key]

    if (typeof currentVal === "string" && currentVal.trim() === "") {
      currentVal = null as any
    }

    const initialNormalized =
      typeof initialVal === "string" && initialVal.trim() === ""
        ? null
        : initialVal

    if (currentVal !== initialNormalized) {
      diff[key] = currentVal
    }
  }

  return diff
}
