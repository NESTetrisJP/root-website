import { concurrentGenerator, Stage } from "animationis"
import Template from "./include/template.mjs"
import { generateNesFieldPiece } from "./include/tetris-game-nes.mjs";

const t = new Template()
const c = t.controller

export default {
  fps: 60,
  component: t.container,
  init: async function () {
    await t.init()
  },
  run: concurrentGenerator([function* () {
    t.gameController.appendPiece(3)
    const fieldPiece = generateNesFieldPiece(3)
    t.game.setCurrentPiece({ ...fieldPiece, position: [8, fieldPiece.position[1]] })
    t.gameController.das = 16
    yield
    for (let j = 0; j < 9; j++) {
      c.press("left")
      for (let i = 0; i < 5; i++) yield
      c.release("left")
      for (let i = 0; i < 5; i++) yield
    }
    for (let i = 0; i < 60; i++) yield

    for (let j = 0; j < 9; j++) {
      c.press("right")
      for (let i = 0; i < 5; i++) yield
      c.release("right")
      for (let i = 0; i < 5; i++) yield
    }
    for (let i = 0; i < 60; i++) yield
  }, function* () {
    for (let i = 0; i < 301; i++) {
      t.update()
      yield
    }
  }])
} as Stage