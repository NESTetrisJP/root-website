import { Component } from "animationis"
import NESSet, { BlockNES } from "./include/nes-set.babel.js"

class ComponentDAS extends Component {
  constructor(a, b) {
    super()
    this.a = a
    this.b = b
    this.f = -20
    this.i = 0
  }
  getSize() { return [120, 24] }
  render(ctx) {
    if (this.f == 0) this.i++
    if (this.f == this.a) this.i++
    if (this.a < this.f && this.i < 8 && ((this.f - this.a) % this.b) == 0) this.i++
    const b = new BlockNES(0, 0)
    ctx.save()
    ctx.translate(12 * this.i, 0)
    b.render(ctx)
    ctx.translate(12, 0)
    b.render(ctx)
    ctx.translate(-12, 12)
    b.render(ctx)
    ctx.translate(12, 0)
    b.render(ctx)
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
      await NESSet.init()
    },
    run: function* () {
      for (let i = 0; i < 100; i++) yield;
    }
  }
})
