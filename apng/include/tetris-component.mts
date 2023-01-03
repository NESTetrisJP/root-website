import { Component } from "animationis"
import { Field, Game, Piece } from "./tetris-game.mjs"

export interface BlockRenderer<TBlock> {
  render(ctx: CanvasRenderingContext2D, block: TBlock): void
}

export interface FieldBackgroundRenderer {
  render(ctx: CanvasRenderingContext2D): void
}

export class FieldBackgroundRendererGrid implements FieldBackgroundRenderer {
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

export interface FieldBorderRenderer {
  getSize(): [number, number]
  getInnerPos(): [number, number]
  render(ctx: CanvasRenderingContext2D): void
}

export class NullFieldBorderRenderer implements FieldBorderRenderer {
  constructor(private readonly fieldSize: [number, number]) {}
  getSize(): [number, number] {
    return this.fieldSize
  }
  getInnerPos(): [number, number] {
    return [0, 0]
  }
  render(ctx: CanvasRenderingContext2D): void {}
}

export class ComponentField<TBlock> extends Component {
  public backgroundFieldBrightness = 0.5
  public foregroundFieldBrightness = 1.0
  public pieceBrightness = 1.3

  constructor(
    private readonly game: Game<TBlock>,
    private readonly borderRenderer: FieldBorderRenderer,
    private readonly backgroundRenderer: FieldBackgroundRenderer,
    private readonly blockRenderer: BlockRenderer<TBlock>) {
    super()
  }
  public getSize() {
    return this.borderRenderer.getSize()
  }
  public render(ctx: CanvasRenderingContext2D) {
    const g = this.game

    this.borderRenderer.render(ctx)
    const [dx, dy] = this.borderRenderer.getInnerPos()
    ctx.save()
    ctx.translate(dx, dy)
    this.backgroundRenderer.render(ctx)

    this.renderField(ctx, g.backgroundField, this.backgroundFieldBrightness)
    this.renderField(ctx, g.foregroundField, this.foregroundFieldBrightness)

    if (g.currentPiece != null) {
      const currentPieceCoords = Piece.getRotatedCoords(Piece.pieceList[g.currentPiece.piece.id], g.currentPiece.rotation)
      const [ox, oy] = g.currentPiece.position
      currentPieceCoords.forEach(([dx, dy], i) => {
        const x = ox + dx
        const y = oy + dy
        if (x < 0 || x >= g.foregroundField.width || y < 0 || y >= g.foregroundField.height) return
        const block = g.currentPiece!.piece.blocks[i]
        ctx.save()
        ctx.translate(x * 12, (19 - y) * 12)
        this.blockRenderer.render(ctx, block)
        this.renderBlockBrightness(ctx, this.pieceBrightness)
        ctx.restore()
      })
    }
    ctx.restore()
  }

  private renderField(ctx: CanvasRenderingContext2D, field: Field<TBlock>, brightness: number) {
    for (let iy = 0; iy < 20; iy++) {
      for (let ix = 0; ix < 10; ix++) {
        const block = field.get(ix, iy)
        if (block == null) continue
        ctx.save()
        ctx.translate(ix * 12, (19 - iy) * 12)
        this.blockRenderer.render(ctx, block)
        this.renderBlockBrightness(ctx, brightness)
        ctx.restore()
      }
    }
  }

  private renderBlockBrightness(ctx: CanvasRenderingContext2D, brightness: number) {
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
}
