import path from "node:path"
import { promises as fs } from "node:fs"
import child_process from "node:child_process"

const execAsync = command => new Promise((resolve, reject) => {
  const child = child_process.exec(command)
  child.stdout.on("data", data => process.stdout.write(data))
  child.stderr.on("data", data => process.stderr.write(data))
  child.on("close", code => {
    if (code == 0) resolve()
    else reject()
  })
})

process.env["NODE_OPTIONS"] = "--loader ts-node/esm"
const initCwd = process.cwd()
const apngDir = path.join(initCwd, "apng")
const outDir = path.join(initCwd, "source/images/apng")
process.chdir(apngDir)
const filenames = await fs.readdir(".")
for (let filename of filenames) {
  if (!filename.endsWith(".mts")) continue
  const stat = await fs.stat(filename)
  if (!stat.isFile()) continue
  const command = `npx animationis --out-dir \"${outDir}\" \"${filename}\"`
  console.log(">>> " + command)
  await execAsync(command)
}
