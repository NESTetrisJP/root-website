// TBlock should be an immutable struct

export type BlockCoord = [number, number]
export type BlockCoordOffset = [number, number]
export type PieceRotation = 0 | 1 | 2 | 3
export type FieldPiece<TBlock> = { piece: Piece<TBlock>, position: BlockCoord, rotation: PieceRotation }

export class Game<TBlock> {
  public backgroundField = new Field<TBlock>(10, 20)
  public foregroundField = new Field<TBlock>(10, 20)
  public currentPiece: FieldPiece<TBlock> | null = null

  public static hitTestFieldPiece<TBlock>(field: Field<TBlock>, fieldPiece: FieldPiece<TBlock>) {
    const currentPieceCoords = Piece.getRotatedCoords(Piece.pieceList[fieldPiece.piece.id], fieldPiece.rotation)
    const [ox, oy] = fieldPiece.position
    return currentPieceCoords.some(([dx, dy], i) => {
      const x = ox + dx
      const y = oy + dy
      if (x < 0 || x >= 10 || y < 0) return true
      if (y >= 20) return false
      if (field.get(x, y) != null) return true
    })
  }

  public moveCurrentPiece(offset: BlockCoordOffset) {
    if (this.currentPiece == null) throw new Error()
    const [px, py] = this.currentPiece.position
    const [dx, dy] = offset
    const newPosition: BlockCoord = [px + dx, py + dy]
    if (Game.hitTestFieldPiece(this.foregroundField, { ...this.currentPiece, position: newPosition })) return false
    this.currentPiece.position = newPosition
    return true
  }

  public rotateCurrentPiece(dr: number, rotationSystem: RotationSystem = defaultRotationSystem) {
    if (this.currentPiece == null) throw new Error()
    const prevRot = this.currentPiece.rotation
    const newRot = ((prevRot + 4 + dr) % 4) as PieceRotation
    const result = rotationSystem.tryRotate(this.foregroundField, this.currentPiece.piece, this.currentPiece.position, prevRot, newRot)
    if (result.success) {
      this.currentPiece.position = result.newPosition
      this.currentPiece.rotation = newRot
      return true
    }
    return false
  }

  public static setFieldPiece<TBlock>(field: Field<TBlock>, fieldPiece: FieldPiece<TBlock>) {
    const currentPieceCoords = Piece.getRotatedCoords(Piece.pieceList[fieldPiece.piece.id], fieldPiece.rotation)
    const [ox, oy] = fieldPiece.position
    currentPieceCoords.forEach(([dx, dy], i) => {
      const x = ox + dx
      const y = oy + dy
      if (x < 0 || x >= field.width || y < 0 || y >= field.height) return
      field.set(x, y, fieldPiece.piece.blocks[i])
    })
  }

  public setCurrentPiece(fieldPiece: FieldPiece<TBlock>) {
    this.currentPiece = fieldPiece
  }
  public setCurrentPieceToBackground() {
    if (this.currentPiece == null) throw new Error()
    Game.setFieldPiece(this.backgroundField, this.currentPiece)
  }
  public setCurrentPieceToForeground() {
    if (this.currentPiece == null) throw new Error()
    Game.setFieldPiece(this.foregroundField, this.currentPiece)
  }
}

export class Field<TBlock> {
  public array: (TBlock | null)[][]
  constructor(public readonly width: number, public readonly height: number) {
    this.array = new Array(height).fill(undefined).map(() => new Array(width).fill(undefined).map(() => null))
  }
  public get(x: number, y: number) {
    return this.array[y][x]
  }
  public set(x: number, y: number, block: TBlock | null) {
    this.array[y][x] = block
  }
  public clear() {
    this.array.forEach(r => r.fill(null))
  }
}

export class Piece<TBlock> {
  public static readonly pieceNames = ["I", "J", "L", "O", "S", "T", "Z"]
  public static readonly pieceList: BlockCoord[][] = [
    [[-1, 0], [ 0, 0], [ 1, 0], [2, 0]],  // I
    [[-1, 1], [-1, 0], [ 0, 0], [1, 0]],  // J
    [[ 1, 1], [-1, 0], [ 0, 0], [1, 0]],  // L
    [[ 0, 1], [ 1, 1], [ 0, 0], [1, 0]],  // O
    [[ 0, 1], [ 1, 1], [-1, 0], [0, 0]],  // S
    [[ 0, 1], [-1, 0], [ 0, 0], [1, 0]],  // T
    [[-1, 1], [ 0, 1], [ 0, 0], [1, 0]]   // Z
  ]
  public static getRotatedCoord(coord: BlockCoord, r: PieceRotation) {
    if (r === 0) return [ coord[0],  coord[1]]
    if (r === 1) return [ coord[1], -coord[0]]
    if (r === 2) return [-coord[0], -coord[1]]
    if (r === 3) return [-coord[1],  coord[0]]
    throw new Error()
  }
  public static getRotatedCoords(coords: BlockCoord[], r: PieceRotation) {
    return coords.map(e => Piece.getRotatedCoord(e, r))
  }
  public readonly blocks: TBlock[]
  constructor(public readonly id: number, blocks: TBlock | TBlock[]) {
    if (Array.isArray(blocks)) {
      this.blocks = blocks
    } else {
      this.blocks = Piece.pieceList[id].map(e => blocks)
    }
  }
}

export interface RotationSystem {
  tryRotate<TBlock>(field: Field<TBlock>, piece: Piece<TBlock>, prevPosition: BlockCoord, prevRot: PieceRotation, newRot: PieceRotation): RotationResult
}

export type RotationResult = RotationResultSuccess | RotationResultFailure
export type RotationResultSuccess = {
  success: true,
  newPosition: BlockCoord,
}
export type RotationResultFailure = {
  success: false,
}

export class DefaultRotationSystem implements RotationSystem {
  public tryRotate<TBlock>(field: Field<TBlock>, piece: Piece<TBlock>, prevPosition: BlockCoord, prevRot: PieceRotation, newRot: PieceRotation): RotationResult {
    if (Game.hitTestFieldPiece(field, { piece: piece, position: prevPosition, rotation: newRot })) {
      return {
        success: false,
      }
    }
    return {
      success: true,
      newPosition: prevPosition,
    }
  }
}
const defaultRotationSystem = new DefaultRotationSystem()