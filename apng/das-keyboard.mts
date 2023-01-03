import { Component, Stage } from "animationis"
import { NesBlockRenderer, NesResources } from "./include/tetris-component-nes.mjs"

class ComponentDAS extends Component {
  private f = 0
  private i = 0
  constructor() {
    super()
  }
  getSize(): [number, number] { return [152, 56] }
  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = (10 <= this.f && this.f < 40) ? "#888" : "#CCC"
    ctx.fillRect(0, 0, 24, 24)
    ctx.strokeRect(0, 0, 24, 24)
    ctx.fillRect(16, 40, 8, 8)
    ctx.strokeRect(16, 40, 8, 8)
    ctx.fillStyle = "#CCC"
    ctx.fillRect(8, 32, 8, 8)
    ctx.strokeRect(8, 32, 8, 8)
    ctx.fillRect(0, 40, 8, 8)
    ctx.strokeRect(0, 40, 8, 8)
    ctx.fillRect(8, 48, 8, 8)
    ctx.strokeRect(8, 48, 8, 8)
    ctx.fillStyle = "#000"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.font = "12px Sans"
    ctx.fillText("A", 12, 4)
    if (this.f == 10) this.i++
    if (this.f == 20) this.i++
    if (20 < this.f && this.f < 40 && ((this.f - 20) % 3) == 0) this.i++
    ctx.textAlign = "left"
    ctx.font = "15px Sans"
    ctx.fillText("".padStart(this.i, "a"), 32, 3)
    const blockRenderer = new NesBlockRenderer()
    ctx.save()
    ctx.translate(32 + 12 * this.i, 32)
    blockRenderer.render(ctx, 0)
    ctx.translate(12, 0)
    blockRenderer.render(ctx, 0)
    ctx.translate(-12, 12)
    blockRenderer.render(ctx, 0)
    ctx.translate(12, 0)
    blockRenderer.render(ctx, 0)
    ctx.restore()
    this.f++
  }
}

const component = new ComponentDAS()

export default [
  {
    fps: 30,
    component: component,
    init: async function() {
      await NesResources.init()
    },
    run: function* () {
      for (let i = 0; i < 60; i++) yield;
    }
  }
] as Stage[]
