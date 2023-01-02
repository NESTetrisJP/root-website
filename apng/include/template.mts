import { ComponentField, FieldBackgroundGrid } from "./tetris.mjs"
import NESSet, { FieldBorderNES, Controller, ComponentControllerNES, FieldControllerNES, ComponentDAS, RotationSystemNES, BlockNES, NESButton } from "./nes-set.mjs"
import { ContainerVerticalAlign } from "./containers.mjs"

export default class Template {
  public readonly controller = new Controller<NESButton>(["left", "right", "up", "down", "a", "b"])

  private readonly controllerComponent = new ComponentControllerNES(this.controller)
  public readonly field = new ComponentField(new FieldBorderNES(), new FieldBackgroundGrid(), new RotationSystemNES())
  public readonly fieldController = new FieldControllerNES(this.field, this.controller)
  private readonly dasComponent = new ComponentDAS(144, () => this.fieldController.das)

  public readonly container = new ContainerVerticalAlign()

  constructor() {
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

  setField(array: number[][]) {
    for (let iy = 0; iy < array.length; iy++) {
      for (let ix = 0; ix < 10; ix++) {
        const id = array[array.length - iy - 1][ix]
        if (id != -1) this.field.foregroundField[iy][ix] = new BlockNES(id, null)
      }
    }
  }
}