import chokidar from 'chokidar'
import { relative, join, dirname, resolve } from 'node:path'
import { readdirSync, existsSync, mkdirSync, copyFileSync, unlinkSync, rmdirSync } from 'node:fs'
import { glob } from 'glob'
import { type GeneratorOptions } from '@kooboo/compile'
import { calculateContentHash, getResourceContent, getResourceInfo } from './utils.js'
import { resource, auth } from '@kooboo/core'
import ora from 'ora'
import { getSrcDir } from './utils.js'
import { handleFileChange, handleFileDelete } from './handle.js'
import { watchSiteResourcePaths, watchModuleResourcePaths } from './config.js'

export { watchSiteResourcePaths, watchModuleResourcePaths }

interface SyncOptions {
  siteUrl: string
  auth: {
    username: string
    password: string
  }
  alias?: Record<string, string>
  babelGenerateOptions?: GeneratorOptions
  commonModulePath?: string
  init?: boolean
}

const pathHashMap = new Map<string, string>()
const hashOldPathMap = new Map<string, string>()
const recentlyAddFileHash = new Set<string>()

const isLocked = () => {
  return existsSync(resolve(process.cwd(), 'kooboo-cli.lock'))
}

export async function syncPush(options: SyncOptions) {
  const spinner = ora('Starting development...').start()
  const { siteUrl, auth: authData, commonModulePath, init } = options

  await auth.loginBySite(siteUrl, authData)
  await resource.loadResourceList()

  const srcDir = getSrcDir()
  // 监听的文件类型

  const watchTarget = [...watchSiteResourcePaths, ...watchModuleResourcePaths]
  const watcher = chokidar.watch(glob.sync(watchTarget), {
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    persistent: true,
    ignoreInitial: !init,
    atomic: true
  })

  // 处理文件变化
  watcher
    .on('ready', () => {
      spinner.succeed(`Start development success! ${srcDir}`)
    })
    .on('add', (filePath) => {
      if (isLocked()) {
        return
      }
      const resourceInfo = getResourceInfo(filePath)
      const content = getResourceContent(filePath)
      if (resourceInfo.type === 'api' || resourceInfo.type === 'page') {
        const hash = calculateContentHash(content)
        pathHashMap.set(filePath, hash)
        recentlyAddFileHash.add(hash)
        setTimeout(async () => {
          if (!recentlyAddFileHash.has(hash)) {
            const oldPath = hashOldPathMap.get(hash)
            if (oldPath) {
              // 如果该hash在400ms内被删除，且在hashNewPathMap中存在，则认为该hash是重命名的文件
              hashOldPathMap.delete(hash)
              pathHashMap.delete(oldPath)
              await handleFileDelete(oldPath, getResourceInfo(oldPath))
              handleFileChange(filePath, resourceInfo, content)
              return
            }
          }
          handleFileChange(filePath, resourceInfo, content)
        }, 400)
      } else {
        handleFileChange(filePath, resourceInfo, content)
      }
    })
    .on('change', (filePath) => {
      if (isLocked()) {
        return
      }
      const resourceInfo = getResourceInfo(filePath)
      if (resourceInfo.type === 'api' || resourceInfo.type === 'page') {
        const contentHash = calculateContentHash(getResourceContent(filePath))
        pathHashMap.set(filePath, contentHash)
      }
      handleFileChange(filePath, resourceInfo, getResourceContent(filePath))
    })
    .on('unlink', (filePath) => {
      if (isLocked()) {
        return
      }
      const resourceInfo = getResourceInfo(filePath)
      if (resourceInfo.type === 'api' || resourceInfo.type === 'page') {
        const hash = pathHashMap.get(filePath)
        if (hash) {
          if (recentlyAddFileHash.has(hash)) {
            recentlyAddFileHash.delete(hash)
            hashOldPathMap.set(hash, filePath)
            return
          }
        }
      }
      handleFileDelete(filePath, resourceInfo)
      pathHashMap.delete(filePath)
    })

  if (commonModulePath) {
    const moduleRoot = getSrcDir('module')
    const moduleDirs = readdirSync(moduleRoot)
    chokidar
      .watch(commonModulePath, {
        ignoreInitial: true,
        ignored: (path) => {
          if (path.split(/\/|\\/).some((seg) => seg?.startsWith('.'))) {
            return true
          }
          return path.includes('tsconfig.json')
        }
      })
      .on('all', (event, filePath) => {
        if (isLocked()) {
          return
        }
        try {
          const relativePath = relative(commonModulePath, filePath)
          for (const dir of moduleDirs) {
            if (dir.startsWith('.')) {
              continue
            }

            const targetPath = resolve(moduleRoot, dir, relativePath)
            const relativeModulePath = join(dir, relativePath)
            if (event === 'add' || event === 'change') {
              mkdirSync(dirname(targetPath), { recursive: true })
              copyFileSync(filePath, targetPath)
              ora(`[SYNC] ${relativePath} → ${relativeModulePath}`).succeed()
            } else if (event === 'unlink') {
              if (existsSync(targetPath)) {
                unlinkSync(targetPath)
                ora(`[DELETE] ${relativeModulePath}`).warn()
              }
            } else if (event === 'unlinkDir') {
              if (!readdirSync(targetPath).length) {
                rmdirSync(targetPath)
                ora(`[DELETE] ${relativeModulePath}`).warn()
              }
            }
          }
        } catch (err) {
          ora(`[ERROR] ${err}`).fail()
        }
      })
  }
}

export async function execPush(filePath: string) {
  if (isLocked()) {
    return
  }
  const resourceInfo = getResourceInfo(filePath)
  await handleFileChange(filePath, resourceInfo, getResourceContent(filePath))
}
