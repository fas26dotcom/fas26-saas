import { render, screen } from "@testing-library/react"
import ContentPage from "../src/app/content/page"

describe("ContentPage", () => {
  it("renders the content generation page", () => {
    render(<ContentPage />)
    expect(screen.getByText("AI Content Generation")).toBeInTheDocument()
  })
  
  it("renders template library", () => {
    render(<ContentPage />)
    expect(screen.getByText("Template Library")).toBeInTheDocument()
    expect(screen.getByText("Blog Post")).toBeInTheDocument()
  })
})