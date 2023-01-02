import { Component } from "animationis"

export type BlockCoord = [number, number]
export type BlockCoordOffset = [number, number]
export type Rotation = 0 | 1 | 2 | 3
export type FieldData = (Block | null)[][]
export type FieldMino = { mino: Mino, pos: BlockCoord, rot: Rotation } // TODO: CurrentMinoもこれにする

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
  ] as BlockCoord[][],
  getRotatedCoord: (coord: BlockCoord, r: Rotation) => {
    if (r === 0) return [ coord[0],  coord[1]]
    if (r === 1) return [ coord[1], -coord[0]]
    if (r === 2) return [-coord[0], -coord[1]]
    if (r === 3) return [-coord[1],  coord[0]]
    throw new Error()
  },
  getRotatedCoords: (coords: BlockCoord[], r: Rotation) => {
    return coords.map(e => Tetris.getRotatedCoord(e, r))
  }
}

export class Mino {
  constructor(public readonly id: number, public readonly blocks: Block[]) {}
}

export class Block {
  public render(ctx: CanvasRenderingContext2D) {
    throw new Error("render() must be overridden")
  }
}

export class FieldBorder {
  public getSize(): [number, number] {
    throw new Error("getSize() must be overridden")
  }
  public getInnerPos(): [number, number] {
    throw new Error("getInnerPos() must be overridden")
  }
  public render(ctx: CanvasRenderingContext2D) {
    throw new Error("render() must be overridden")
  }
}

export class FieldBackground {
  public render(ctx: CanvasRenderingContext2D) {
    throw new Error("render() must be overridden")
  }
}

export class FieldBackgroundGrid extends FieldBackground {
  public render(ctx: CanvasRenderingContext2D) {
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
  public rotate(id: number, prev: Rotation, current: Rotation): BlockCoordOffset {
    throw new Error("rotate() must be overridden")
  }
}

function emptyField(width: number, height: number): FieldData {
  return new Array(height).fill(undefined).map(() => new Array(width).fill(undefined).map(() => null))
}

export class ComponentField extends Component {
  public backgroundField = emptyField(10, 20)
  public foregroundField = emptyField(10, 20)
  public currentMino: Mino | null = null
  public currentMinoPos: BlockCoord | null = null
  public currentMinoRot: Rotation | null = null
  private backgroundFieldBrightness = 0.5
  private foregroundFieldBrightness = 1.0
  private minoBrightness = 1.3
  constructor(private readonly border: FieldBorder, private readonly background: FieldBackground, private readonly rotationSystem: RotationSystem) {
    super()
  }
  public getSize() {
    return this.border.getSize()
  }
  public render(ctx: CanvasRenderingContext2D) {
    this.border.render(ctx)
    const [dx, dy] = this.border.getInnerPos()
    ctx.save()
    ctx.translate(dx, dy)
    this.background.render(ctx)

    this.renderField(ctx, this.backgroundField, this.backgroundFieldBrightness)
    this.renderField(ctx, this.foregroundField, this.foregroundFieldBrightness)

    if (this.currentMino != null) {
      const currentMinoCoords = Tetris.getRotatedCoords(Tetris.minoList[this.currentMino.id], this.currentMinoRot!)
      for (let i = 0; i < 4; i++) {
        const [ox, oy] = this.currentMinoPos!
        const [dx, dy] = currentMinoCoords[i]
        const x = ox + dx
        const y = oy + dy
        if (x < 0 || x >= 10 || y < 0 || y >= 20) continue
        const block = this.currentMino.blocks[i]
        ctx.save()
        ctx.translate(x * 12, (19 - y) * 12)
        block.render(ctx)
        this.renderBrightness(ctx, this.minoBrightness)
        ctx.restore()
      }
    }
    ctx.restore()
  }

  private renderField(ctx: CanvasRenderingContext2D, field: FieldData, brightness: number) {
    for (let iy = 0; iy < 20; iy++) {
      for (let ix = 0; ix < 10; ix++) {
        if (!field[iy][ix]) continue
        ctx.save()
        ctx.translate(ix * 12, (19 - iy) * 12)
        field[iy][ix]!.render(ctx) // TODO !!!
        this.renderBrightness(ctx, brightness)
        ctx.restore()
      }
    }
  }

  private renderBrightness(ctx: CanvasRenderingContext2D, brightness: number) {
    const b = Math.floor(brightness * 255)
    if (b < 255) {
      ctx.fillStyle = `rgba(${b}, ${b}, ${b}, 1)`
      ctx.globalCompositeOperation = "multiply"
      ctx.fillRect(0, 0, 12, 12)
    } else if (b > 255) {
      ctx.fillStyle = `rgba(${b-255}, ${b-255}, ${b-255}, 1)`
      ctx.globalCompositeOperation = "screen"
      ctx.fillRect(0, 0, 12, 12)
    }
  }

  private hitTestMino(mino: Mino, pos: BlockCoord, rot: Rotation) {
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

  public moveMino(offset: BlockCoordOffset) {
    if (this.currentMino == null) throw new Error()
    const [px, py] = this.currentMinoPos!
    const [dx, dy] = offset
    const current: BlockCoord = [px + dx, py + dy]
    if (this.hitTestMino(this.currentMino, current, this.currentMinoRot!)) return false
    this.currentMinoPos = current
    return true
  }

  rotateMino(dr: number) {
    if (this.currentMino == null) throw new Error()
    const prev = this.currentMinoRot!
    const current = ((prev + 4 + dr) % 4) as Rotation
    const [dx, dy] = this.rotationSystem.rotate(this.currentMino.id, prev, current)
    this.currentMinoPos![0] += dx
    this.currentMinoPos![1] += dy
    this.currentMinoRot = current
  }

  private setMino(minoId: number, blocks: Block[], pos: BlockCoord, rot: Rotation, field: FieldData) {
    const currentMinoCoords = Tetris.getRotatedCoords(Tetris.minoList[minoId], rot)
    for (let i = 0; i < 4; i++) {
      const [ox, oy] = pos
      const [dx, dy] = currentMinoCoords[i]
      const x = ox + dx
      const y = oy + dy
      if (x < 0 || x >= 10 || y < 0 || y >= 20) continue
      field[y][x] = blocks[i]
    }
  }

  public setNewCurrentMino(fieldMino: FieldMino) {
    this.currentMino = fieldMino.mino
    this.currentMinoPos = fieldMino.pos
    this.currentMinoRot = fieldMino.rot
  }

  public setCurrentMinoToBackground() {
    if (this.currentMino == null) throw new Error()
    this.setMino(this.currentMino.id, this.currentMino.blocks, this.currentMinoPos!, this.currentMinoRot!, this.backgroundField)
  }
  public setCurrentMinoToForeground() {
    if (this.currentMino == null) throw new Error()
    this.setMino(this.currentMino.id, this.currentMino.blocks, this.currentMinoPos!, this.currentMinoRot!, this.foregroundField)
  }
}

