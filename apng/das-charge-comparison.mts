import { concurrentGenerator, Stage } from "animationis"
import Template from "./include/template.mjs"

export default [
  createChargeComparison("no-charge", 0),
  createChargeComparison("full-charge", 16)
]
function createChargeComparison(name: string, initialDas: number): Stage {
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
      t.gameController.appendPiece(0)
      t.gameController.setLevelAndUpdateSpeed(19)
      t.gameController.das = initialDas
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