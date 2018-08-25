import { concurrentGenerator } from "animationis"
import Template from "./include/template.babel.js"
import { generateFieldMino, BlockNES } from "./include/nes-set.babel.js";


export default [
  createChargeComparison("partially-charge", 10, 5),
  createChargeComparison("full-charge", 16, 6)
]
function createChargeComparison(name, initialDas, height) {
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
      for (let iy = 0; iy < height; iy++) t.field.foregroundField[iy][1] = new BlockNES(1, null)
      t.fieldController.spawnTimer = 16
      t.fieldController.appendMino(0)
      t.fieldController.setLevelAndUpdateSpeed(19)
      t.fieldController.das = initialDas
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