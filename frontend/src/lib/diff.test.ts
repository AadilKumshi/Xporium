import { describe, it, expect } from "vitest"
import { diffChanges } from "./diff"

describe("diffChanges", () => {
  it("returns only changed properties", () => {
    const initial = {
      name: "Experiment A",
      description: "Old description",
      dataset_name: "Dataset 1",
    }
    const current = {
      name: "Experiment B",
      description: "Old description",
      dataset_name: "Dataset 1",
    }

    const diff = diffChanges(initial, current)
    expect(diff).toEqual({ name: "Experiment B" })
  })

  it("returns empty object when nothing changed", () => {
    const initial = { a: 1, b: "test" }
    const current = { a: 1, b: "test" }

    const diff = diffChanges(initial, current)
    expect(diff).toEqual({})
  })

  it("handles empty strings vs undefined or null correctly", () => {
    const initial = { description: "Initial", project_url: "" }
    const current = { description: "", project_url: "" }

    const diff = diffChanges(initial, current)
    expect(diff).toEqual({ description: null })
  })
})
