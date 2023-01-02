import Animationis, { Component } from "animationis"
import { Tetris, Block, Mino, FieldBorder, RotationSystem, Rotation, BlockCoordOffset, FieldData, ComponentField, FieldMino, BlockCoord } from "./tetris.mjs"
import Path from "path"
import Url from "url"
import { Image } from "canvas"

/*
 * Source: http://meatfighter.com/nintendotetrisai/
 */

const minoColor = [0, 2, 1, 0, 2, 0, 1]
const initialPos: BlockCoord[] = [[4, 19], [5, 19], [5, 19], [4, 18], [5, 18], [5, 19], [5, 18]]
const initialRot: Rotation[] = [0, 2, 2, 0, 0, 2, 0]
export function generateMino(id: number) {
  const blocks = [0, 1, 2, 3].map(() => new BlockNES(minoColor[id], null))
  return new Mino(id, blocks)
}

export function generateFieldMino(id: number): FieldMino {
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
  public rotate(id: number, prev: Rotation, current: Rotation): BlockCoordOffset {
    const offsetSet = rotOffset[id]
    const [px, py] = offsetSet[prev]
    const [cx, cy] = offsetSet[current]
    return [cx - px, cy - py]
  }
}

// TODO
export const Resources = {
  _initialized: false,
  fieldBorder: null as (ImageBitmap | null),
  blocks: null as (ImageBitmap | null)
}

const dirname = Path.dirname(Url.fileURLToPath(import.meta.url))
export default {
  init: async () => {
    if (!Resources._initialized) {
      Resources.fieldBorder = await Animationis.loadImage(Path.join(dirname, "/fieldborder-nes.png"))
      Resources.blocks = await Animationis.loadImage(Path.join(dirname, "/blocks-nes.png"))
      Resources._initialized = true
    }
  }
}

export class FieldBorderNES extends FieldBorder {
  public getSize(): [number, number] {
    return [144, 264]
  }
  public getInnerPos(): [number, number] {
    return [12, 12]
  }
  public render(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(Resources.fieldBorder!, 0, 0)
  }
}

export class BlockNES extends Block {
  // TODO
  constructor(private readonly type: number, private readonly color: any) {
    super()
  }
  render(ctx: CanvasRenderingContext2D) {
    const sx = this.type * 12
    const sy = 0
    const ss = 12
    const size = 12
    ctx.drawImage(Resources.blocks!, sx, sy, ss, ss, 0, 0, size, size)
  }
}


export type NESButton = "left" | "right" | "up" | "down" | "a" | "b"
type ButtonState = 0 | 1 | 2 | 3
export class Controller<TButton> {
  private readonly state: Map<TButton, ButtonState>
  private readonly accepted: Map<TButton, boolean>
  constructor(private readonly buttons: TButton[]) {
    this.state = new Map(buttons.map(e => [e, 0]))
    this.accepted = new Map(buttons.map(e => [e, false]))
  }

  public press(button: TButton) {
    if (this.state.get(button) === 1) this.state.set(button, 2)
    else this.state.set(button, 1)
    this.accepted.set(button, true)
  }

  public release(button: TButton) {
    if (this.state.get(button) === 3) this.state.set(button, 0)
    else this.state.set(button, 3)
    this.accepted.set(button, true)
  }

  public update() {
    this.state.forEach((v, k) => {
      if (!this.accepted.get(k)) {
        if (v === 1) this.state.set(k, 2)
        if (v === 3) this.state.set(k, 0)
      }
      this.accepted.set(k, false)
    })
  }

  public justPressed(button: TButton) { return this.state.get(button) === 1 }
  public pressed(button: TButton) { return this.state.get(button) === 1 || this.state.get(button) === 2 }
  public justReleased(button: TButton) { return this.state.get(button) === 3 }
}

export class FieldControllerNES {
  public das = 0
  public dropRepeat = -96
  private fall = 0
  private readonly speedTable = [48, 43, 38, 33, 28, 23, 18, 13, 8, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
  private level = -1
  private speed = Infinity
  private nextMinos: number[] = []
  public spawnTimer = 0
  constructor(private readonly field: ComponentField, private readonly controller: Controller<NESButton>) {}

  update() {
    const f = this.field
    const c = this.controller

    if (f.currentMino == null) {
      if (this.spawnTimer == 0) {
        if (this.nextMinos.length > 0) {
          const fieldMino = generateFieldMino(this.nextMinos.shift()!)
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

  drop(skipLookup: boolean) {
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

  setLevelAndUpdateSpeed(level: number) {
    this.level = level
    this.speed = this.level < 0 ? Infinity : this.level >= 29 ? 1 : this.speedTable[this.level]
  }

  appendMino(minoId: number) {
    this.nextMinos.push(minoId)
  }
}

export class ComponentControllerNES extends Component {
  constructor(private readonly controller: Controller<NESButton>) {
    super()
  }

  getSize(): [number, number] { return [104, 56] }

  render(ctx: CanvasRenderingContext2D) {
    // background
    ctx.fillStyle = "#CCC"
    ctx.fillRect(0, 0, 104, 56)
    ctx.fillStyle = "#222"
    ctx.fillRect(4, 8, 96, 44)

    // button border
    ctx.fillStyle = "#CCC"
    // d-pad
    ctx.fillRect(8, 22, 36, 16)
    ctx.fillRect(18, 12, 16, 36)
    // b
    ctx.fillRect(52, 28, 20, 20)
    // a
    ctx.fillRect(76, 28, 20, 20)

    // button background
    // d-pad
    ctx.fillStyle = "#222"
    ctx.fillRect(10, 24, 32, 12)
    ctx.fillRect(20, 14, 12, 32)

    ctx.fillStyle = "#800"
    // b
    ctx.beginPath()
    ctx.arc(62, 38, 8, 0, Math.PI * 2, false)
    ctx.fill()
    // a
    ctx.beginPath()
    ctx.arc(86, 38, 8, 0, Math.PI * 2, false)
    ctx.fill()

    ctx.fillStyle = "#fff"
    if (this.controller.pressed("left")) {
      ctx.fillRect(10, 24, 8, 12)
    }
    if (this.controller.pressed("right")) {
      ctx.fillRect(34, 24, 8, 12)
    }
    if (this.controller.pressed("up")) {
      ctx.fillRect(20, 14, 12, 8)
    }
    if (this.controller.pressed("down")) {
      ctx.fillRect(20, 38, 12, 8)
    }
    if (this.controller.pressed("b")) {
      ctx.beginPath()
      ctx.arc(62, 38, 8, 0, Math.PI * 2, false)
      ctx.fill()
    }
    if (this.controller.pressed("a")) {
      ctx.beginPath()
      ctx.arc(86, 38, 8, 0, Math.PI * 2, false)
      ctx.fill()
    }
  }
}

export class ComponentDAS extends Component {
  constructor(private readonly width: number, private readonly das: () => number) {
    super()
  }
  getSize(): [number, number] { return [this.width, 12] }
  render(ctx: CanvasRenderingContext2D) {
    const das = this.das()
    ctx.fillStyle = "#7F1400"
    ctx.fillRect(0, 0, this.width * 9 / 16, 12)
    ctx.fillStyle = "#7D7A00"
    ctx.fillRect(this.width * 9 / 16, 0, this.width * 5 / 16, 12)
    ctx.fillStyle = "#1A5035"
    ctx.fillRect(this.width * 14 / 16, 0, this.width * 2 / 16, 12)
    ctx.fillStyle = das < 10 ? "#FF2800" : das < 15 ? "#FAF500" : "#35A16B"
    ctx.fillRect(0, 0, this.width * das / 16, 12)

    ctx.font = "bold 12px sans-serif"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.lineWidth = 3
    ctx.strokeStyle = das < 10 ? "#7F1400" : das < 15 ? "#7D7A00" : "#1A5035"
    ctx.strokeText(String(das), 0, 6)
    ctx.fillStyle = "#FFF"
    ctx.fillText(String(das), 0, 6)
  }
}