import fse from 'fs-extra'
import path from 'path'
import os from 'node:os'

export type KoobooCliConfig = {
  username: string
  password: string
}

const configKeyArr = ['username', 'password']

const projectPath = path.join(process.cwd(), '.kooboo-cli', 'config.json')
const globalPath = path.join(os.homedir(), '.kooboo-cli', 'config.json')

export function getConfig(
  target: 'global' | 'project' = 'project'
): Partial<KoobooCliConfig> | null {
  const configPath = target === 'global' ? globalPath : projectPath
  const config = fse.readJSONSync(configPath, { throws: false })
  return config
}

export async function setConfig(
  config: Partial<KoobooCliConfig>,
  target: 'global' | 'project' = 'project'
) {
  const configPath = target === 'global' ? globalPath : projectPath
  const originConfig = getConfig(target) || {}
  fse.outputJSONSync(configPath, {
    ...originConfig,
    ...config
  })
}

export function checkConfigKey(key: string) {
  return configKeyArr.includes(key)
}

export function getUserNameAndPassword() {
  const username = process.env.KOOBOO_USERNAME || ''
  const password = process.env.KOOBOO_PASSWORD || ''
  if (!username || !password) return null
  return { username, password }
}
