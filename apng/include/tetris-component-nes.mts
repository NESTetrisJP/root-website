import Animationis, { Component } from "animationis"
import Path from "path"
import Url from "url"
import { BlockRenderer, FieldBorderRenderer } from "./tetris-component.mjs"
import { Controller, NesBlock, NesButton } from "./tetris-game-nes.mjs"

const dirname = Path.dirname(Url.fileURLToPath(import.meta.url))
// TODO: ImageBitmap is a fake
export const NesResources = {
  _initialized: false,
  fieldBorder: null as (ImageBitmap | null),
  blocks: null as (ImageBitmap | null),

  init: async () => {
    if (!NesResources._initialized) {
      NesResources.fieldBorder = await Animationis.loadImage(Path.join(dirname, "/fieldborder-nes.png"))
      NesResources.blocks = await Animationis.loadImage(Path.join(dirname, "/blocks-nes.png"))
      NesResources._initialized = true
    }
  }
}

export class NesFieldBorderRenderer implements FieldBorderRenderer {
  public getSize(): [number, number] {
    return [144, 264]
  }
  public getInnerPos(): [number, number] {
    return [12, 12]
  }
  public render(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(NesResources.fieldBorder!, 0, 0)
  }
}

export class NesBlockRenderer implements BlockRenderer<NesBlock> {
  render(ctx: CanvasRenderingContext2D, block: NesBlock) {
    const sx = block * 12
    const sy = 0
    const ss = 12
    const size = 12
    ctx.drawImage(NesResources.blocks!, sx, sy, ss, ss, 0, 0, size, size)
  }
}

export class ComponentNesControllerViewer extends Component {
  constructor(private readonly controller: Controller<NesButton>) {
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

export class ComponentDasViewer extends Component {
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