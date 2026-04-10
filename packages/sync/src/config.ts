import path from 'node:path'
import { getSrcDir } from './utils.js'

const srcDir = getSrcDir()

export const WATCH_SITE_RESOURCE_DIRS = [
  'api',
  'code',
  'pagescript',
  'js',
  'css',
  'layout',
  'page',
  'view'
]
export const WATCH_MODULE_RESOURCE_DIRS = [
  'api',
  'backend',
  'code',
  'file',
  'img',
  'js',
  'root',
  'css',
  'view'
]

export const watchSiteResourcePaths = WATCH_SITE_RESOURCE_DIRS.map(dir =>
  path.join(srcDir, dir)
)
export const watchModuleResourcePaths = WATCH_MODULE_RESOURCE_DIRS.map(dir =>
  path.join(srcDir, 'module', '**', dir)
)
