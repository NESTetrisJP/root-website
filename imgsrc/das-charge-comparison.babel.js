import { concurrentGenerator } from "animationis"
import Template from "./include/template.babel.js"
import { generateFieldMino } from "./include/nes-set.babel.js";


export default [
  createChargeComparison("no-charge", 0),
  createChargeComparison("full-charge", 16)
]
function createChargeComparison(name, initialDas) {
  const t = new Template()
  const c = t.controller
  return {
    name: name,
    fps: 60,
    component: t.container,
    init: async function () {
      await t.init()
    },
    run: concurrentGenerator([function* () {
      t.fieldController.appendMino(0)
      t.fieldController.setLevelAndUpdateSpeed(19)
      t.fieldController.das = initialDas
      c.press("left")
      for (let i = 0; i < 5; i++) yield
      c.press("a")
      for (let i = 0; i < 5; i++) yield
      c.release("a")
      for (let i = 0; i < 50; i++) yield
      c.release("left")
      for (let i = 0; i < 60; i++) yield
    }, function* () {
      for (let i = 0; i < 120; i++) {
        t.update()
        yield
      }
    }])
  }
}