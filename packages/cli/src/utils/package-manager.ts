import { spawn } from 'cross-spawn'

export type PackageManager = 'npm' | 'pnpm' | 'yarn'

export async function installDependencies(
  projectPath: string,
  packageManager: PackageManager,
  dependencies: string[],
  isDev: boolean = false
): Promise<void> {
  if (!dependencies.length) return
  const args = isDev ? ['add', '-D', ...dependencies] : ['add', ...dependencies]
  await executeCommand(packageManager, args, projectPath)
}

async function executeCommand(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit' })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} ${args.join(' ')} failed with code ${code}`))
      }
    })
  })
}
