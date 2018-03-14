import { Component } from "animationis"

export default class ComponentText extends Component {
  constructor(size, text) {
    super()
    this.size = size
    this.text = text
  }
  getSize() {
    return this.size

  }
  render(ctx) {
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    ctx.fillStyle = "#000"
    ctx.fillText(this.text, 0, 0, this.size[0])

  }
}
