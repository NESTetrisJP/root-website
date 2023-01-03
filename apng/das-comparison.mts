import { Component, Stage } from "animationis"
import { NesBlockRenderer, NesResources } from "./include/tetris-component-nes.mjs"

class ComponentDAS extends Component {
  private f = -20
  private i = 0
  constructor(private readonly a: number, private readonly b: number) {
    super()
  }
  getSize(): [number, number] { return [120, 24] }
  render(ctx: CanvasRenderingContext2D) {
    if (this.f == 0) this.i++
    if (this.f == this.a) this.i++
    if (this.a < this.f && this.i < 8 && ((this.f - this.a) % this.b) == 0) this.i++
    const blockRenderer = new NesBlockRenderer()
    ctx.save()
    ctx.translate(12 * this.i, 0)
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

const platforms = [
  {name: "nes", a: 16, b: 6},
  {name: "tgm", a: 14, b: 1},
  {name: "toj", a: 7, b: 3},
  {name: "ppt", a: 11, b: 2},
  {name: "gb", a: 24, b: 9},
]

export default platforms.map(e => {
  return {
    name: e.name,
    fps: 60,
    component: new ComponentDAS(e.a, e.b),
    init: async function() {
      await NesResources.init()
    },
    run: function* () {
      for (let i = 0; i < 100; i++) yield;
    }
  } as Stage
})
