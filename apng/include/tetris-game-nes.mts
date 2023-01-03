import { BlockCoord, Field, FieldPiece, Game, Piece, PieceRotation, RotationResult, RotationSystem } from "./tetris-game.mjs"

/*
 * Source: http://meatfighter.com/nintendotetrisai/
 */

export type NesBlock = 0 | 1 | 2

const pieceColor: NesBlock[] = [0, 2, 1, 0, 2, 0, 1]
const pieceInitialPosition: BlockCoord[] = [[4, 19], [5, 19], [5, 19], [4, 18], [5, 18], [5, 19], [5, 18]]
const pieceInitialRotation: PieceRotation[] = [0, 2, 2, 0, 0, 2, 0]

export function generateNesFieldPiece(id: number): FieldPiece<NesBlock> {
  return {
    piece: new Piece(id, pieceColor[id]),
    position: pieceInitialPosition[id],
    rotation: pieceInitialRotation[id]
  }
}


export class NesGameController {
  private static readonly speedTable = [48, 43, 38, 33, 28, 23, 18, 13, 8, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]

  public das = 0
  public dropRepeat = -96
  private fall = 0
  private level = -1
  private speed = Infinity
  private nextPieceIds: number[] = []
  public spawnTimer = 0
  private rotationSystem = new NesRotationSystem()
  constructor(private readonly game: Game<NesBlock>, private readonly controller: Controller<NesButton>) {}

  public update() {
    const g = this.game
    const c = this.controller

    if (g.currentPiece == null) {
      if (this.spawnTimer == 0) {
        if (this.nextPieceIds.length > 0) {
          const fieldPiece = generateNesFieldPiece(this.nextPieceIds.shift()!)
          g.setCurrentPiece(fieldPiece)
        }
      } else {
        this.spawnTimer--
      }
    } else {
      if (c.justPressed("a")) {
        g.rotateCurrentPiece(1, this.rotationSystem)
      } else if (c.justPressed("b")) {
        g.rotateCurrentPiece(-1, this.rotationSystem)
      }
      if (!c.pressed("down")) {
        if (c.justPressed("right")) {
          const success = g.moveCurrentPiece([1, 0])
          this.das = success ? 0 : 16
        }
        else if (c.justPressed("left")) {
          const success = g.moveCurrentPiece([-1, 0])
          this.das = success ? 0 : 16
        }
        else if (c.pressed("right")) {
          this.das++
          if (this.das >= 16) {
            this.das = 10
            const success = g.moveCurrentPiece([1, 0])
            if (!success) this.das = 16
          }
        }
        else if (c.pressed("left")) {
          this.das++
          if (this.das >= 16) {
            this.das = 10
            const success = g.moveCurrentPiece([-1, 0])
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

  public drop(skipLookup: boolean) {
    if (!skipLookup) {
      this.speed = this.level < 0 ? Infinity : this.level >= 29 ? 1 : NesGameController.speedTable[this.level]
    }
    if (skipLookup || this.fall >= this.speed) {
      this.fall = 0
      const success = this.game.moveCurrentPiece([0, -1])
      if (!success) {
        this.game.setCurrentPieceToForeground()
        this.game.currentPiece = null
        this.spawnTimer = 12
      }
    }
  }

  public setLevelAndUpdateSpeed(level: number) {
    this.level = level
    this.speed = this.level < 0 ? Infinity : this.level >= 29 ? 1 : NesGameController.speedTable[this.level]
  }

  public appendPiece(pieceId: number) {
    this.nextPieceIds.push(pieceId)
  }
}

const rotOffsetI = [[0, 0], [1, 1], [1, 0], [1, 0]]
const rotOffsetO = [[0, 0], [0, 1], [1, 1], [1, 0]]
const rotOffsetSZ = [[0, 0], [0, 1], [0, 1], [1, 1]]
const rotOffsetLJT = [[0, 0], [0, 0], [0, 0], [0, 0]]
export const rotOffset = [rotOffsetI, rotOffsetLJT, rotOffsetLJT, rotOffsetO, rotOffsetSZ, rotOffsetLJT, rotOffsetSZ]

export class NesRotationSystem implements RotationSystem {
  public tryRotate<TBlock>(field: Field<TBlock>, piece: Piece<TBlock>, prevPosition: BlockCoord, prevRot: PieceRotation, newRot: PieceRotation): RotationResult {
    const offsetSet = rotOffset[piece.id]
    const [px, py] = offsetSet[prevRot]
    const [cx, cy] = offsetSet[newRot]
    const newPosition: BlockCoord = [prevPosition[0] + cx - px, prevPosition[1] + cy - py]
    if (Game.hitTestFieldPiece(field, { piece: piece, position: newPosition, rotation: newRot })) {
      return {
        success: false,
      }
    }
    return {
      success: true,
      newPosition: newPosition,
    }
  }
}

export const nesButtons = ["left", "right", "up", "down", "a", "b"] as const
export type NesButton = typeof nesButtons[number]
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
