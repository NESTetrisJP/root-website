import { Stage } from "animationis"
import { ContainerVerticalAlign } from "./include/containers.mjs"
import { NesBlockRenderer, NesFieldBorderRenderer, NesResources } from "./include/tetris-component-nes.mjs"
import { ComponentField, FieldBackgroundRendererGrid } from "./include/tetris-component.mjs"
import { generateNesFieldPiece, NesBlock, NesRotationSystem } from "./include/tetris-game-nes.mjs"
import { Game } from "./include/tetris-game.mjs"
import ComponentText from "./include/text-component.mjs"

const game = new Game<NesBlock>()
const rotationSystem = new NesRotationSystem()
const field = new ComponentField(game, new NesFieldBorderRenderer(), new FieldBackgroundRendererGrid(), new NesBlockRenderer())
const text = new ComponentText([100, 20], "Test")
const container = new ContainerVerticalAlign()
container.addComponent(field, 0)
container.addComponent(text, 0)

export default [
  {
    fps: 30,
    component: container,
    init: async function() {
      await NesResources.init()
    },
    run: function* () {
      let das = 16
      let drop = 0
      const fieldPiece = generateNesFieldPiece(0)
      game.setCurrentPiece(fieldPiece)
      game.rotateCurrentPiece(1, rotationSystem)
      for (let i = 0; i < 60; i++) {
        if (i > 0) {
          if (das >= 15) {
            das = 10
            game.moveCurrentPiece([1, 0])
          }
          else das++
        }
        game.setCurrentPieceToBackground()
        if (drop === 1) {
          drop = 0
          game.moveCurrentPiece([0, -1])
        }
        game.setCurrentPieceToBackground()
        yield
        drop ++
      }
    }
  }
] as Stage[]
