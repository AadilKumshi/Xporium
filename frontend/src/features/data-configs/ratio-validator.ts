export function validateRatios(
  train: number,
  val: number,
  test: number
): { valid: boolean; sum: number; message?: string } {
  const sum = Math.round((train + val + test) * 1000) / 1000
  const valid = Math.abs(sum - 1.0) < 1e-4

  if (!valid) {
    const currentPercent = Math.round(sum * 100)
    return {
      valid: false,
      sum,
      message: `Sum of Ratios must equal 1 (currently ${sum})`,
    }
  }

  return { valid: true, sum: 1.0 }
}
