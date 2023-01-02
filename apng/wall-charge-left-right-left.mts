import { concurrentGenerator } from "animationis"
import Template from "./include/template.mjs"

export default [
  createCase("success", 13),
  createCase("too-early", 12),
  createCase("too-late", 15),
]

function createCase (name: string, waitFrame: number) {
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
      t.setField([
        [-1, -1, -1, -1, -1, -1, -1,  1, -1, -1],
        [-1, -1, -1, -1,  1, -1,  1,  1,  0, -1],
        [-1, -1,  1,  1,  1,  2,  1,  0,  0,  0],
        [-1,  2,  2,  0,  0,  0,  2,  2,  1,  1],
        [-1,  1,  0,  0,  1,  1,  1,  2,  2,  1],
        [-1,  1,  0,  0,  1,  2,  2,  1,  2,  1],
        [-1,  1,  1,  0,  0,  2,  1,  1,  2,  2],
        [-1,  0,  0,  0,  0,  2,  1,  2,  2,  1],
        [-1,  0,  0,  0,  0,  0,  0,  1,  1,  1]
      ])
      t.fieldController.appendMino(3)
      t.fieldController.appendMino(0)
      t.fieldController.setLevelAndUpdateSpeed(19)
      t.fieldController.das = 16
      t.fieldController.spawnTimer = 16
      for (let i = 0; i < 8; i++) yield
      c.press("left")
      for (let i = 0; i < 18; i++) yield
      c.release("left")
      for (let i = 0; i < waitFrame; i++) yield
      c.press("right")
      for (let i = 0; i < 6; i++) yield
      c.release("right")
      for (let i = 0; i < 4; i++) yield
      c.press("left")
      for (let i = 0; i < 10; i++) yield
      c.press("a")
      for (let i = 0; i < 5; i++) yield
      c.release("a")
      for (let i = 0; i < 35; i++) yield
      c.release("left")
    }, function* () {
      for (let i = 0; i < 180; i++) {
        t.update()
        yield
      }
    }])
  }
}
