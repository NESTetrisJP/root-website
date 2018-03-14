import Animationis from "animationis"
import { Tetris, Block, Mino, FieldBorder, RotationSystem } from "./tetris.babel.js"
import Path from "path"

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