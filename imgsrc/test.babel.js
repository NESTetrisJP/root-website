import { Component } from "animationis"
import ComponentText from "./include/text-component.babel.js"
import { ComponentField, FieldBackgroundGrid, FieldMino } from "./include/tetris.babel.js"
import NESSet, { generateFieldMino, BlockNES, FieldBorderNES, RotationSystemNES } from "./include/nes-set.babel.js"

class VerticalContainer extends Component {
  constructor() {
    super()
    this.size = [0, 0]
    this.components = []
  }

  addComponent(component, align) {
    const [oldWidth, oldHeight] = this.size
    const [componentWidth, componentHeight] = component.getSize()
    let newWidth = oldWidth
    if (componentWidth >= oldWidth) newWidth = componentWidth
    const newHeight = oldHeight + componentHeight
    this.size = [newWidth, newHeight]
    this.components.push({
      component: component,
      pos: [0, oldHeight],
    })
  }

  getSize() { return this.size }
  render(ctx) {
    this.components.forEach(e => {
      ctx.save()
      ctx.translate(e.pos[0], e.pos[1])
      e.component.render(ctx)
      ctx.restore()
    })
  }
}

class FreeContainer extends Component {
  constructor(size) {
    super()
    this.size = size
    this.components = []
  }
  getSize() { return this.size }
  addComponent(component, pos) {
    this.components.push({
      component: component,
      pos: pos,
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

const field = new ComponentField(new FieldBorderNES(), new FieldBackgroundGrid())
field.rotationSystem = new RotationSystemNES()
const text = new ComponentText([100, 20], "Test")
const container = new VerticalContainer()
container.addComponent(field)
container.addComponent(text)

export default [
  {
    fps: 30,
    component: container,
    init: async function() {
      await NESSet.init()
    },
    run: function* () {
      let das = 16
      let drop = 0
      const fieldMino = generateFieldMino(0)
      field.currentMino = fieldMino.mino
      field.currentMinoPos = fieldMino.pos
      field.currentMinoRot = fieldMino.rot
      field.rotateMino(1)
      for (let i = 0; i < 60; i++) {
        if (i > 0) {
          if (das >= 15) {
            das = 10
            field.moveMino([1, 0])
          }
          else das++
        }
        field.setCurrentMinoToBackground()
        if (drop === 1) {
          drop = 0
          field.moveMino([0, -1])
        }
        field.setCurrentMinoToBackground()
        yield
        drop ++
      }
    }
  }
]
