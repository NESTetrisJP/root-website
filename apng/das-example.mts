import { concurrentGenerator } from "animationis"
import Template from "./include/template.mjs"
import { generateFieldMino } from "./include/nes-set.mjs";

const t = new Template()
const c = t.controller

export default {
  fps: 60,
  component: t.container,
  init: async function() {
    await t.init()
  },
  run: concurrentGenerator([function* () {
    const fieldMino = generateFieldMino(3)
    t.field.currentMino = fieldMino.mino
    t.field.currentMinoPos = [0, fieldMino.pos[1]]
    t.field.currentMinoRot = fieldMino.rot
    t.fieldController.das = 16
    for (let i = 0; i < 15; i++) yield
    c.press("right")
    for (let i = 0; i < 60; i++) yield
    c.release("right")
    for (let i = 0; i < 30; i++) yield
    c.press("left")
    for (let i = 0; i < 60; i++) yield
    c.release("left")
    for (let i = 0; i < 15; i++) yield
  }, function* () {
    for (let i = 0; i < 180; i++) {
      t.update()
      yield
    }
  }])
}