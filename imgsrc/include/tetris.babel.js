import { Component } from "animationis"

export const Tetris = {
  minoNames: ["I", "J", "L", "O", "S", "T", "Z"],
  minoList: [
    [[-1, 0], [ 0, 0], [ 1, 0], [2, 0]],  // I
    [[-1, 1], [-1, 0], [ 0, 0], [1, 0]],  // J
    [[ 1, 1], [-1, 0], [ 0, 0], [1, 0]],  // L
    [[ 0, 1], [ 1, 1], [ 0, 0], [1, 0]],  // O
    [[ 0, 1], [ 1, 1], [-1, 0], [0, 0]],  // S
    [[ 0, 1], [-1, 0], [ 0, 0], [1, 0]],  // T
    [[-1, 1], [ 0, 1], [ 0, 0], [1, 0]]   // Z
  ],
  getRotatedCoord: (coord, r) => {
    if (r === 0) return [ coord[0],  coord[1]]
    if (r === 1) return [ coord[1], -coord[0]]
    if (r === 2) return [-coord[0], -coord[1]]
    if (r === 3) return [-coord[1],  coord[0]]
  },
  getRotatedCoords: (coords, r) => {
    return coords.map(e => Tetris.getRotatedCoord(e, r))
  }
}

export class Mino {
  constructor(id, blocks) {
    this.id = id
    this.blocks = blocks
  }
}

export class Block {
  render(ctx, size) {
    throw new Error("render() must be overridden")
  }
}

export class FieldBorder {
  getSize() {
    throw new Error("getSize() must be overridden")
  }
  getInnerPos() {
    throw new Error("getInnerPos() must be overridden")
  }
  render(ctx) {
    throw new Error("render() must be overridden")
  }
}

export class FieldBackground {
  render(ctx) {
    throw new Error("render() must be overridden")
  }
}

export class FieldBackgroundGrid extends FieldBackground {
  render(ctx) {
    for (let iy = 0; iy < 20; iy++) {
      for (let ix = 0; ix < 10; ix++) {
        const dx = ix * 12
        const dy = iy * 12
        ctx.fillStyle = "#888"
        ctx.fillRect(dx, dy, 12, 12)
        ctx.fillStyle = "#000"
        ctx.fillRect(dx, dy, 11, 11)
      }
    }
  }
}

export class RotationSystem {
  rotate(prev, current) {
    throw new Error("rotate() must be overridden")
  }
}

function emptyField(width, height) {
  return new Array(height).fill().map(() => new Array(width).fill().map(() => null))
}

export class ComponentField extends Component {
  constructor(border, background) {
    super()
    this.border = border
    this.background = background
    this.backgroundField = emptyField(10, 20)
    this.foregroundField = emptyField(10, 20)
    this.currentMino = null
    this.currentMinoPos = null
    this.currentMinoRot = null
    this.rotationSystem = null
    this.backgroundFieldBrightness = 0.5
  }
  async init() {

  }
  getSize() {
    return this.border.getSize()
  }
  render(ctx) {
    this.border.render(ctx)
    const [dx, dy] = this.border.getInnerPos()
    ctx.save()
    ctx.translate(dx, dy)
    this.background.render(ctx)

    this.renderField(ctx, this.backgroundField, this.backgroundFieldBrightness)

    const currentMinoCoords = Tetris.getRotatedCoords(Tetris.minoList[this.currentMino.id], this.currentMinoRot)
    for (let i = 0; i < 4; i++) {
      const [ox, oy] = this.currentMinoPos
      const [dx, dy] = currentMinoCoords[i]
      const x = ox + dx
      const y = oy + dy
      if (x < 0 || x >= 10 || y < 0 || y >= 20) continue
      const block = this.currentMino.blocks[i]
      ctx.save()
      ctx.translate(x * 12, (19 - y) * 12)
      block.render(ctx)
      ctx.restore()
    }
    ctx.restore()
  }

  renderField(ctx, field, brightness) {
    const b = Math.floor(brightness * 255)
    for (let iy = 0; iy < 20; iy++) {
      for (let ix = 0; ix < 10; ix++) {
        if (!field[iy][ix]) continue
        ctx.save()
        ctx.translate(ix * 12, (19 - iy) * 12)
        field[iy][ix].render(ctx)
        ctx.fillStyle = `rgba(${b}, ${b}, ${b}, 1)`
        ctx.globalCompositeOperation = "multiply"
        ctx.fillRect(0, 0, 12, 12)
        ctx.restore()
      }
    }
  }

  hitTestMino(mino, pos, rot) {
    const currentMinoCoords = Tetris.getRotatedCoords(Tetris.minoList[mino.id], rot)
    for (let i = 0; i < 4; i++) {
      const [ox, oy] = pos
      const [dx, dy] = currentMinoCoords[i]
      const x = ox + dx
      const y = oy + dy
      if (x < 0 || x >= 10 || y < 0) return true
      if (y >= 20) continue
      if (this.foregroundField[y][x]) return true
    }
    return false
  }

  moveMino(offset) {
    const [px, py] = this.currentMinoPos
    const [dx, dy] = offset
    const current = [px + dx, py + dy]
    if (this.hitTestMino(this.currentMino, current, this.currentMinoRot)) return false
    this.currentMinoPos = current
    return true
  }

  rotateMino(dr) {
    const prev = this.currentMinoRot
    const current = (prev + 4 + dr) % 4
    const [dx, dy] = this.rotationSystem.rotate(this.currentMino.id, prev, current)
    this.currentMinoPos[0] += dx
    this.currentMinoPos[1] += dy
    this.currentMinoRot = current
  }

  setCurrentMinoToBackground() {
    const currentMinoCoords = Tetris.getRotatedCoords(Tetris.minoList[this.currentMino.id], this.currentMinoRot)
    for (let i = 0; i < 4; i++) {
      const [ox, oy] = this.currentMinoPos
      const [dx, dy] = currentMinoCoords[i]
      const x = ox + dx
      const y = oy + dy
      if (x < 0 || x >= 10 || y < 0 || y >= 20) continue
      const block = this.currentMino.blocks[i]
      this.backgroundField[y][x] = block
    }
  }
}

