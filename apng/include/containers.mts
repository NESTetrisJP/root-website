import { Component } from "animationis"

type ContainerFreeChildComponentInfo = {
  component: Component
  pos: [number, number]
}

export class ContainerFree extends Component {
  private readonly components: ContainerFreeChildComponentInfo[] = []
  constructor(private readonly size: [number, number]) {
    super()
  }
  public getSize() { return this.size }
  public addComponent(component: Component, pos: [number, number]) {
    this.components.push({
      component: component,
      pos: pos
    })
  }
  public render(ctx: CanvasRenderingContext2D) {
    this.components.forEach(e => {
      ctx.save()
      ctx.translate(e.pos[0], e.pos[1])
      e.component.render(ctx)
      ctx.restore()
    })
  }
}

type ContainerVerticalAlignChildComponentInfo = {
  component: Component
  align: -1 | 0 | 1
  cachedSize: [number, number]
}

export class ContainerVerticalAlign extends Component {
  private readonly components: ContainerVerticalAlignChildComponentInfo[] = []
  private margin: number = 0
  private cachedSize: [number, number] = [0, 0]
  constructor() {
    super()
  }
  public getSize() { return this.cachedSize }
  public recalcSize() {
    let width = 0
    let height = 0
    this.components.forEach((e, i) => {
      e.cachedSize = e.component.getSize()
      if (e.cachedSize[0] > width) width = e.cachedSize[0]
      height += e.cachedSize[1]
      height += this.margin
    })
    if (this.components.length > 0) height -= this.margin
    this.cachedSize = [width, height]
  }
  public addComponent(component: Component, align: -1 | 0 | 1) {
    this.components.push({
      component: component,
      align: align,
      cachedSize: [0, 0]
    })
    this.recalcSize()
  }
  public setMargin(margin: number) {
    this.margin = margin
    this.recalcSize()
  }
  public render(ctx: CanvasRenderingContext2D) {
    let y = 0
    this.components.forEach(e => {
      ctx.save()
      const x = (this.cachedSize[0] - e.cachedSize[0]) / 2 * (e.align + 1)
      ctx.translate(x, y)
      e.component.render(ctx)
      y += e.cachedSize[1]
      y += this.margin
      ctx.restore()
    })
  }
}