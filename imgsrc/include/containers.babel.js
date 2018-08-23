import { Component } from "animationis"

export class ContainerFree extends Component {
  constructor(size) {
    super()
    this.size = size
    this.components = []
  }
  getSize() { return this.size }
  addComponent(component, pos) {
    this.components.push({
      component: component,
      pos: pos
    })
  }
  render(ctx) {
    this.components.forEach(e => {
      ctx.save()
      ctx.translate(e.pos[0], e.pos[1])
      e.component.render(ctx)
      ctx.restore()
    })
  }
}

export class ContainerVerticalAlign extends Component {
  constructor() {
    super()
    this.components = []
    this.size = [0, 0]
  }
  getSize() { return this.size }
  recalcSize() {
    let width = 0
    let height = 0
    this.components.forEach(e => {
      if (e.size[0] > width) width = e.size[0]
      height += e.size[1]
    })
    this.size = [width, height]
  }
  addComponent(component, align) {
    this.components.push({
      component: component,
      align: align,
      size: component.getSize()
    })
    this.recalcSize()
  }
  render(ctx) {
    let y = 0
    this.components.forEach(e => {
      ctx.save()
      const x = (this.size[0] - e.size[0]) / 2 * (e.align + 1)
      ctx.translate(x, y)
      e.component.render(ctx)
      y += e.size[1]
      ctx.restore()
    })
  }
}