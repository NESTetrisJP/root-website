import { Component } from "animationis"

export default class ComponentText extends Component {
  constructor(private readonly size: [number, number], private readonly text: string) {
    super()
  }
  getSize() {
    return this.size
  }
  render(ctx: CanvasRenderingContext2D) {
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    ctx.fillStyle = "#000"
    ctx.fillText(this.text, 0, 0, this.size[0])
  }
}
