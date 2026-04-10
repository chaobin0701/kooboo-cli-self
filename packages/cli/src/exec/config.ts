import { checkConfigKey, getConfig, setConfig } from '../utils/config.js'
import type { KoobooCliConfig } from '../utils/config.js'
import ora from 'ora'
export async function configAction(
  key?: keyof KoobooCliConfig,
  value?: string,
  options?: { global?: true }
) {
  const target = !!options?.global ? 'global' : 'project'

  if (!key) {
    const config = getConfig(target)
    if (!config) {
      ora(
        `No config found for ${target}, please run 'kbs config ${key} <value>' to set config`
      ).fail()
      return
    }
    console.log(config)
    return
  }
  if (!checkConfigKey(key)) {
    ora(`Invalid config key: ${key}`).fail()
    return
  }
  if (value) {
    setConfig({ [key]: value }, target)
  } else {
    const config = getConfig(target)
    if (!config) {
      ora(
        `No config found for ${target}, please run 'kbs config ${key} <value>' to set config`
      ).fail()
      return
    }
    console.log(config[key])
  }
}
