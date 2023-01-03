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
    t.gameController.appendPiece(3)
    t.gameController.setLevelAndUpdateSpeed(18)
    for (let i = 0; i < 5; i++) yield
    c.press("left")
    for (let i = 0; i < 25; i++) yield
    c.release("left")
    for (let i = 0; i < 90; i++) yield
  }, function* () {
    for (let i = 0; i < 120; i++) {
      t.update()
      yield
    }
  }])
} as Stage