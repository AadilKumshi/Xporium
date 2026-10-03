import { describe, it, expect } from "vitest"
import { formatErrorMessage } from "./client"

describe("formatErrorMessage", () => {
  it("formats string detail from HTTPException", () => {
    const error = formatErrorMessage(400, { detail: "Username already exists" })
    expect(error).toBe("Username already exists")
  })

  it("formats 422 pydantic validation array", () => {
    const error = formatErrorMessage(422, {
      detail: [
        { loc: ["body", "name"], msg: "Field required" },
        { loc: ["body", "train_ratio"], msg: "Input should be greater than 0" },
      ],
    })
    expect(error).toBe("name: Field required, train_ratio: Input should be greater than 0")
  })

  it("handles Message property", () => {
    const error = formatErrorMessage(200, { Message: "User created" })
    expect(error).toBe("User created")
  })
})
