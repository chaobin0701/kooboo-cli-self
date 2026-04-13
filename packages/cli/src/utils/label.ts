import fse from 'fs-extra'
import path from 'node:path'
import type { LabelItem } from '@kooboo/core'

export type LabelEditableJson = Record<string, Record<string, string>>
export type LabelRawJson = LabelItem[]

export function getLabelCachePath(projectPath = process.cwd()) {
  return path.join(projectPath, '.kooboo-cli', 'labels.json')
}

export function getLabelRawCachePath(projectPath = process.cwd()) {
  return path.join(projectPath, '.kooboo-cli', 'labels.raw.json')
}

export function readLabelCache(projectPath = process.cwd()): LabelEditableJson | null {
  const labelCachePath = getLabelCachePath(projectPath)
  const config = fse.readJSONSync(labelCachePath, { throws: false })
  return config && typeof config === 'object' && !Array.isArray(config)
    ? (config as LabelEditableJson)
    : null
}

export function readLabelRawCache(projectPath = process.cwd()): LabelRawJson | null {
  const labelCachePath = getLabelRawCachePath(projectPath)
  const config = fse.readJSONSync(labelCachePath, { throws: false })
  return Array.isArray(config) ? (config as LabelRawJson) : null
}

export function convertLabelListToEditable(labels: LabelRawJson): LabelEditableJson {
  const editable: LabelEditableJson = {}

  for (const label of labels) {
    if (!label?.name || !label.values || typeof label.values !== 'object') {
      continue
    }

    for (const [culture, value] of Object.entries(label.values)) {
      if (typeof value !== 'string') {
        continue
      }

      if (!editable[culture]) {
        editable[culture] = {}
      }
      editable[culture][label.name] = value
    }
  }

  return editable
}

export function writeLabelCache(labels: LabelEditableJson, projectPath = process.cwd()) {
  const labelCachePath = getLabelCachePath(projectPath)
  fse.outputJSONSync(labelCachePath, labels, {
    spaces: 2
  })
}

export function writeLabelRawCache(labels: LabelRawJson, projectPath = process.cwd()) {
  const labelCachePath = getLabelRawCachePath(projectPath)
  fse.outputJSONSync(labelCachePath, labels, {
    spaces: 2
  })
}

export function writeLabelCaches(labels: LabelRawJson, projectPath = process.cwd()) {
  writeLabelRawCache(labels, projectPath)
  writeLabelCache(convertLabelListToEditable(labels), projectPath)
}
