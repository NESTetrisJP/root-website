import { concurrentGenerator, Stage } from "animationis"
import Template from "./include/template.mjs"

const t = new Template()
const c = t.controller

export default {
  fps: 60,
  component: t.container,
  init: async function () {
    await t.init()
  },
  run: concurrentGenerator([function* () {
    t.setField([
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1,  1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1,  1, -1,  2, -1, -1, -1,  0, -1],
      [ 0,  0,  1,  1,  2,  2, -1,  0,  0, -1],
      [ 0,  0,  1,  1,  1,  2,  1,  1,  0, -1],
      [ 0,  0,  1,  0,  0,  1,  1,  1,  1, -1],
      [ 0,  0,  1,  0,  0,  1,  1,  1,  2, -1],
      [ 1,  1,  1,  1,  0,  0,  0,  2,  2, -1]
    ])
    t.gameController.appendPiece(3)
    t.gameController.appendPiece(0)
    t.gameController.setLevelAndUpdateSpeed(19)
    t.gameController.das = 16
    t.gameController.spawnTimer = 16
    for (let i = 0; i < 8; i++) yield
    c.press("left")
    for (let i = 0; i < 35; i++) yield
    c.release("left")
    for (let i = 0; i < 6; i++) yield
    c.press("right")
    for (let i = 0; i < 10; i++) yield
    c.press("a")
    for (let i = 0; i < 5; i++) yield
    c.release("a")
    for (let i = 0; i < 30; i++) yield
    c.release("right")
  }, function* () {
    for (let i = 0; i < 180; i++) {
      t.update()
      yield
    }
  }])
} as Stage