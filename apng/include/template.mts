import { ContainerVerticalAlign } from "./containers.mjs"
import { NesResources, ComponentDasViewer, ComponentNesControllerViewer, NesBlockRenderer, NesFieldBorderRenderer } from "./tetris-component-nes.mjs"
import { ComponentField, FieldBackgroundRendererGrid } from "./tetris-component.mjs"
import { Controller, NesBlock, NesButton, nesButtons, NesGameController } from "./tetris-game-nes.mjs"
import { Game } from "./tetris-game.mjs"

export default class Template {
  public readonly controller = new Controller<NesButton>([...nesButtons])

  public readonly game = new Game<NesBlock>()
  public readonly gameController = new NesGameController(this.game, this.controller)
  private readonly fieldRenderer = new ComponentField(this.game, new NesFieldBorderRenderer(), new FieldBackgroundRendererGrid(), new NesBlockRenderer())
  private readonly controllerViewer = new ComponentNesControllerViewer(this.controller)
  private readonly dasViewer = new ComponentDasViewer(144, () => this.gameController.das)

  public readonly container = new ContainerVerticalAlign()

  constructor() {
    this.container.addComponent(this.fieldRenderer, 0)
    this.container.addComponent(this.controllerViewer, 0)
    this.container.addComponent(this.dasViewer, 0)
    this.container.setMargin(4)
  }

  public async init() {
    await NesResources.init()
    this.gameController.dropRepeat = 0
  }

  public update() {
    this.controller.update()
    this.gameController.update()
  }

  public setField(array: (NesBlock | -1)[][]) {
    for (let iy = 0; iy < array.length; iy++) {
      for (let ix = 0; ix < 10; ix++) {
        const id = array[array.length - iy - 1][ix]
        if (id != -1) this.game.foregroundField.set(ix, iy, id)
      }
    }
  }
}