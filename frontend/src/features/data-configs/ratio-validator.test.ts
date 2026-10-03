import { describe, it, expect } from "vitest"
import { validateRatios } from "./ratio-validator"

describe("validateRatios", () => {
  it("validates when ratios sum to 1.0", () => {
    const res = validateRatios(0.8, 0.2, 0.0)
    expect(res.valid).toBe(true)
    expect(res.sum).toBe(1.0)
  })

  it("handles floating point inaccuracies cleanly", () => {
    const res = validateRatios(0.7, 0.2, 0.1)
    expect(res.valid).toBe(true)
  })

  it("fails when ratios sum to 0.95", () => {
    const res = validateRatios(0.7, 0.2, 0.05)
    expect(res.valid).toBe(false)
    expect(res.message).toContain("must equal 100%")
  })

  it("fails when ratios exceed 1.0", () => {
    const res = validateRatios(0.8, 0.3, 0.1)
    expect(res.valid).toBe(false)
  })
})
