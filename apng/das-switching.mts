import { concurrentGenerator } from "animationis"
import Template from "./include/template.mjs"

const t = new Template()
const c = t.controller

export default {
  fps: 30,
  component: t.container,
  init: async function () {
    await t.init()
  },
  run: concurrentGenerator([function* () {
    t.gameController.appendPiece(5)
    t.gameController.appendPiece(0)
    t.gameController.setLevelAndUpdateSpeed(19)
    for (let i = 0; i < 5; i++) yield
    c.press("right")
    c.press("a")
    for (let i = 0; i < 5; i++) yield
    c.release("a")
    for (let i = 0; i < 5; i++) yield
    c.press("a")
    for (let i = 0; i < 5; i++) yield
    c.release("a")
    for (let i = 0; i < 22; i++) yield
    c.release("right")

    for (let i = 0; i < 5; i++) yield
    c.press("left")
    for (let i = 0; i < 10; i++) yield
    c.press("a")
    for (let i = 0; i < 5; i++) yield
    c.release("a")
    for (let i = 0; i < 40; i++) yield
    c.release("left")
  }, function* () {
    for (let i = 0; i < 150; i++) {
      t.update()
      yield
    }
  }])
}