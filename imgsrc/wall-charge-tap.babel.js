import { concurrentGenerator } from "animationis"
import Template from "./include/template.babel.js"
import { generateFieldMino } from "./include/nes-set.babel.js";

const t = new Template()
const c = t.controller

export default {
  fps: 60,
  component: t.container,
  init: async function () {
    await t.init()
  },
  run: concurrentGenerator([function* () {
    t.fieldController.appendMino(3)
    const fieldMino = generateFieldMino(3)
    t.field.currentMino = fieldMino.mino
    t.field.currentMinoPos = [8, fieldMino.pos[1]]
    t.field.currentMinoRot = fieldMino.rot
    t.fieldController.das = 16
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
}