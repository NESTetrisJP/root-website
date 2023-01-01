import { ComponentField, FieldBackgroundGrid } from "./tetris.babel.js"
import NESSet, { FieldBorderNES, Controller, ComponentControllerNES, FieldControllerNES, ComponentDAS, RotationSystemNES, BlockNES } from "./nes-set.babel.js"
import { ContainerVerticalAlign } from "./containers.babel.js"

export default class Template {
  constructor() {
    this.controller = new Controller(["left", "right", "up", "down", "a", "b"])

    this.controllerComponent = new ComponentControllerNES(this.controller)
    this.field = new ComponentField(new FieldBorderNES(), new FieldBackgroundGrid(), new RotationSystemNES())
    this.fieldController = new FieldControllerNES(this.field, this.controller)
    this.dasComponent = new ComponentDAS(144, () => this.fieldController.das)

    this.container = new ContainerVerticalAlign()
    this.container.addComponent(this.field, 0)
    this.container.addComponent(this.controllerComponent, 0)
    this.container.addComponent(this.dasComponent, 0)
    this.container.setMargin(4)
  }

  async init() {
    await NESSet.init()
    this.fieldController.dropRepeat = 0
  }

  update() {
    this.controller.update()
    this.fieldController.update()
  }

  setField(array) {
    for (let iy = 0; iy < array.length; iy++) {
      for (let ix = 0; ix < 10; ix++) {
        const id = array[array.length - iy - 1][ix]
        if (id != -1) this.field.foregroundField[iy][ix] = new BlockNES(id, null)
      }
    }
  }
}