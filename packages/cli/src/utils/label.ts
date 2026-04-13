import fse from 'fs-extra'
import path from 'node:path'
import type { LabelItem } from '@kooboo/core'

export type LabelCacheJson = LabelItem[]

export function getLabelCachePath(projectPath = process.cwd()) {
  return path.join(projectPath, '.kooboo-cli', 'labels.json')
}

export function readLabelCache(projectPath = process.cwd()): LabelCacheJson | null {
  const labelCachePath = getLabelCachePath(projectPath)
  const config = fse.readJSONSync(labelCachePath, { throws: false })
  return Array.isArray(config) ? (config as LabelCacheJson) : null
}

export function writeLabelCache(labels: LabelCacheJson, projectPath = process.cwd()) {
  const labelCachePath = getLabelCachePath(projectPath)
  fse.outputJSONSync(labelCachePath, labels, {
    spaces: 2
  })
}

