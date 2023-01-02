import { Component } from "animationis"
import { ContainerVerticalAlign } from "./include/containers.mjs"
import ComponentText from "./include/text-component.mjs"
import { ComponentField, FieldBackgroundGrid, FieldMino, RotationSystem } from "./include/tetris.mjs"
import NESSet, { generateFieldMino, BlockNES, FieldBorderNES, RotationSystemNES } from "./include/nes-set.mjs"

const field = new ComponentField(new FieldBorderNES(), new FieldBackgroundGrid(), new RotationSystemNES())
const text = new ComponentText([100, 20], "Test")
const container = new ContainerVerticalAlign()
container.addComponent(field, 0)
container.addComponent(text, 0)

export default [
  {
    fps: 30,
    component: container,
    init: async function() {
      await NESSet.init()
    },
    run: function* () {
      let das = 16
      let drop = 0
      const fieldMino = generateFieldMino(0)
      field.currentMino = fieldMino.mino
      field.currentMinoPos = fieldMino.pos
      field.currentMinoRot = fieldMino.rot
      field.rotateMino(1)
      for (let i = 0; i < 60; i++) {
        if (i > 0) {
          if (das >= 15) {
            das = 10
            field.moveMino([1, 0])
          }
          else das++
        }
        field.setCurrentMinoToBackground()
        if (drop === 1) {
          drop = 0
          field.moveMino([0, -1])
        }
        field.setCurrentMinoToBackground()
        yield
        drop ++
      }
    }
  }
]
