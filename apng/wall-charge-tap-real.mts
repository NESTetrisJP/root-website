import { concurrentGenerator } from "animationis"
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
      [0,  0, -1, -1, -1, -1, -1, -1, -1, -1],
      [0,  0, -1, -1, -1, -1, -1, -1, -1, -1],
      [0,  0,  1, -1, -1, -1, -1, -1, -1, -1],
      [0,  0,  1, -1,  2, -1, -1, -1,  0, -1],
      [0,  0,  1,  1,  2,  2, -1,  0,  0, -1],
      [0,  0,  1,  1,  1,  2,  1,  1,  0, -1],
      [0,  0,  1,  0,  0,  1,  1,  1,  1, -1],
      [0,  0,  1,  0,  0,  1,  1,  1,  2, -1],
      [1,  1,  1,  1,  0,  0,  0,  2,  2, -1]
    ])
    t.fieldController.appendMino(2)
    t.fieldController.appendMino(3)
    t.fieldController.setLevelAndUpdateSpeed(19)
    t.fieldController.das = 16
    t.fieldController.spawnTimer = 16
    for (let i = 0; i < 18; i++) yield
    c.press("left")
    for (let i = 0; i < 2; i++) yield
    c.press("a")
    for (let i = 0; i < 3; i++) yield
    c.release("left")
    for (let i = 0; i < 2; i++) yield
    c.release("a")
    for (let i = 0; i < 3; i++) yield
    c.press("left")
    for (let i = 0; i < 5; i++) yield
    c.release("left")
    for (let i = 0; i < 8; i++) yield
    c.press("left")
    for (let i = 0; i < 45; i++) yield
    c.release("left")
  }, function* () {
    for (let i = 0; i < 180; i++) {
      t.update()
      yield
    }
  }])
}