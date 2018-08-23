import Animationis from "animationis"
import { Tetris, Block, Mino, FieldBorder, RotationSystem } from "./tetris.babel.js"
import Path from "path"

/*
 * Source: http://meatfighter.com/nintendotetrisai/
 */

const minoColor = [0, 2, 1, 0, 2, 0, 1]
const initialPos = [[4, 19], [5, 19], [5, 19], [4, 18], [5, 18], [5, 19], [5, 18]]
const initialRot = [0, 2, 2, 0, 0, 2, 0]
export function generateMino(id) {
  const blocks = [0, 1, 2, 3].map(() => new BlockNES(minoColor[id], null))
  return new Mino(id, blocks)
}

export function generateFieldMino(id) {
  return {
    mino: generateMino(id),
    pos: initialPos[id],
    rot: initialRot[id]
  }
}

const rotOffsetI = [[0, 0], [1, 1], [1, 0], [1, 0]]
const rotOffsetO = [[0, 0], [0, 1], [1, 1], [1, 0]]
const rotOffsetSZ = [[0, 0], [0, 1], [0, 1], [1, 1]]
const rotOffsetLJT = [[0, 0], [0, 0], [0, 0], [0, 0]]
export const rotOffset = [rotOffsetI, rotOffsetLJT, rotOffsetLJT, rotOffsetO, rotOffsetSZ, rotOffsetLJT, rotOffsetSZ]


export class RotationSystemNES extends RotationSystem {
  rotate(id, prev, current) {
    const offsetSet = rotOffset[id]
    const [px, py] = offsetSet[prev]
    const [cx, cy] = offsetSet[current]
    return [cx - px, cy - py]
  }
}

export const Resources = {
  _initialized: false,
  fieldBorder: null,
  blocks: null
}

export default {
  init: async () => {
    if (!Resources._initialized) {
      Resources.fieldBorder = await Animationis.loadImage(Path.join(__dirname, "/fieldborder-nes.png"))
      Resources.blocks = await Animationis.loadImage(Path.join(__dirname, "/blocks-nes.png"))
      Resources._initialized = true
    }
  }
}

export class FieldBorderNES extends FieldBorder {
  getSize() {
    return [144, 264]
  }
  getInnerPos() {
    return [12, 12]
  }
  render(ctx) {
    ctx.drawImage(Resources.fieldBorder, 0, 0)
  }
}

export class BlockNES extends Block {
  constructor(type, color) {
    super()
    this.type = type
    this.color = color
  }
  render(ctx, cfg) {
    const sx = this.type * 12
    const sy = 0
    const ss = 12
    const size = 12
    ctx.drawImage(Resources.blocks, sx, sy, ss, ss, 0, 0, size, size)
  }
}

export class Controller {
  constructor(buttons) {
    this.buttons = buttons
    this.state = new Map(buttons.map(e => [e, 0]))
    this.accepted = new Map(buttons.map(e => [e, false]))
  }

  press(button) {
    if (this.state.get(button) === 1) this.state.set(button, 2)
    else this.state.set(button, 1)
    this.accepted.set(button, true)
  }

  release(button) {
    if (this.state.get(button) === 3) this.state.set(button, 0)
    else this.state.set(button, 3)
    this.accepted.set(button, true)
  }

  update() {
    this.state.forEach((v, k) => {
      if (!this.accepted.get(k)) {
        if (v === 1) this.state.set(k, 2)
        if (v === 3) this.state.set(k, 0)
      }
      this.accepted.set(k, false)
    })
  }

  justPressed(button) { return this.state.get(button) === 1 }
  pressed(button) { return this.state.get(button) === 1 || this.state.get(button) === 2 }
  justReleased(button) { return this.state.get(button) === 3 }
}

export class FieldControllerNES {
  constructor(field, controller) {
    this.field = field
    this.controller = controller
    this.das = 0
    this.dropRepeat = -96
    this.fall = 0
    this.speedTable = [48, 43, 38, 33, 28, 23, 18, 13, 8, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
    this.level = -1
    this.speed = Infinity
    this.nextMinos = []
    this.spawnTimer = 0
  }

  update() {
    const f = this.field
    const c = this.controller

    if (f.currentMino == null) {
      if (this.spawnTimer == 0) {
        if (this.nextMinos.length > 0) {
          const fieldMino = generateFieldMino(this.nextMinos.shift())
          f.setNewCurrentMino(fieldMino)
        }
      } else {
        this.spawnTimer--
      }
    } else {
      if (c.justPressed("a")) {
        f.rotateMino(1)
      } else if (c.justPressed("b")) {
        f.rotateMino(0)
      }
      if (!c.pressed("down")) {
        if (c.justPressed("right")) {
          const success = f.moveMino([1, 0])
          this.das = success ? 0 : 16
        }
        else if (c.justPressed("left")) {
          const success = f.moveMino([-1, 0])
          this.das = success ? 0 : 16
        }
        else if (c.pressed("right")) {
          this.das++
          if (this.das >= 16) {
            this.das = 10
            const success = f.moveMino([1, 0])
            if (!success) this.das = 16
          }
        }
        else if (c.pressed("left")) {
          this.das++
          if (this.das >= 16) {
            this.das = 10
            const success = f.moveMino([-1, 0])
            if (!success) this.das = 16
          }
        }
      }

      this.fall++

      if (this.dropRepeat < 0 && c.justPressed("down")) {
        this.dropRepeat = 0
      }

      if (this.dropRepeat === 0) {
        if (c.justPressed("down") && !c.pressed("left") || !c.pressed("right")) {
          this.dropRepeat = 1
        }
        this.drop(false)
      }
      else if (this.dropRepeat > 0) {
        if (c.pressed("down") && !c.pressed("left") && !c.pressed("right")) {
          this.dropRepeat++
          if (this.dropRepeat < 3) {
            this.drop(false)
          } else {
            this.dropRepeat = 1
            // holdDownPoints++
            this.drop(true)
          }
        } else {
          this.dropRepeat = 0
          // holdDownPoints = 0
          this.drop(false)
        }
      }

      if (this.dropRepeat < 0 && !c.justPressed("down")) {
        this.dropRepeat++
      }
    }
  }

  drop(skipLookup) {
    if (!skipLookup) {
      this.speed = this.level < 0 ? Infinity : this.level >= 29 ? 1 : this.speedTable[this.level]
    }
    if (skipLookup || this.fall >= this.speed) {
      this.fall = 0
      const success = this.field.moveMino([0, -1])
      if (!success) {
        this.field.setCurrentMinoToForeground()
        this.field.currentMino = null
        this.spawnTimer = 12
      }
    }
  }

  setLevelAndUpdateSpeed(level) {
    this.level = level
    this.speed = this.level < 0 ? Infinity : this.level >= 29 ? 1 : this.speedTable[this.level]
  }

  appendMino(mino) {
    this.nextMinos.push(mino)
  }
}

export class ComponentControllerNES {
  constructor(controller) {
    this.controller = controller
  }

  getSize() { return [88, 36] }

  render(ctx) {
    ctx.save()
    ctx.translate(0, 12)
    this.renderDirection(ctx, "left")
    ctx.translate(12, -12)
    this.renderDirection(ctx, "up")
    ctx.translate(0, 24)
    this.renderDirection(ctx, "down")
    ctx.translate(12, -12)
    this.renderDirection(ctx, "right")

    ctx.translate(32, 12)
    this.renderButton(ctx, "b")
    ctx.translate(24, 0)
    this.renderButton(ctx, "a")
    ctx.restore()
  }

  renderDirection(ctx, button) {
    const pressed = this.controller.pressed(button)
    ctx.fillStyle = pressed ? "#444" : "#CCC"
    ctx.fillRect(0, 0, 12, 12)
    ctx.strokeRect(0, 0, 12, 12)
  }

  renderButton(ctx, button) {
    const pressed = this.controller.pressed(button)
    ctx.fillStyle = pressed ? "#444" : "#CCC"
    ctx.beginPath()
    ctx.arc(0, 0, 8, 0, Math.PI * 2, false)
    ctx.fill()
    ctx.stroke()
  }
}

export class ComponentDAS {
  constructor(width, das) {
    this.width = width
    this.das = das
  }
  getSize() { return [this.width, 12] }
  render(ctx) {
    const das = this.das()
    ctx.fillStyle = "#7F1400"
    ctx.fillRect(0, 0, this.width * 9 / 16, 12)
    ctx.fillStyle = "#7D7A00"
    ctx.fillRect(this.width * 9 / 16, 0, this.width * 5 / 16, 12)
    ctx.fillStyle = "#1A5035"
    ctx.fillRect(this.width * 14 / 16, 0, this.width * 2 / 16, 12)
    ctx.fillStyle = das < 10 ? "#FF2800" : das < 15 ? "#FAF500" : "#35A16B"
    ctx.fillRect(0, 0, this.width * das / 16, 12)
  }
}