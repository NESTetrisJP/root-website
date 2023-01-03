import { concurrentGenerator, Stage } from "animationis"
import Template from "./include/template.mjs"

export default [
  createChargeComparison("partially-charge", 10, 5),
  createChargeComparison("full-charge", 16, 6)
]
function createChargeComparison(name: string, initialDas: number, height: number): Stage {
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
      for (let iy = 0; iy < height; iy++) t.game.foregroundField.set(1, iy, 1)
      t.gameController.spawnTimer = 16
      t.gameController.appendPiece(0)
      t.gameController.setLevelAndUpdateSpeed(19)
      t.gameController.das = initialDas
      for (let i = 0; i < 10; i++) yield
      c.press("left")
      for (let i = 0; i < 11; i++) yield
      c.press("a")
      for (let i = 0; i < 5; i++) yield
      c.release("a")
      for (let i = 0; i < 50; i++) yield
      c.release("left")
      for (let i = 0; i < 44; i++) yield
    }, function* () {
      for (let i = 0; i < 120; i++) {
        t.update()
        yield
      }
    }])
  }
}