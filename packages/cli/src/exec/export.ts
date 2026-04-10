import type { ExportActionOptions, ExportStoreNameDto } from '../types'
import { ensureLogin } from '../utils/common'
import { upsertLine } from '../utils/writeFile'
import inquirer, { type DistinctQuestion } from 'inquirer'
import { site } from '@kooboo/core'
import { createWriteStream, readFileSync, writeFileSync } from 'fs'
import ora from 'ora'
import { resolve } from 'path'

type ExportAnswers = {
  file?: string
  storeNames: string[]
  moduleNames: string[]
  save: boolean
}

const exportEnvName = 'KOOBOO_DEFAULT_EXPORTS'
const fileEnvName = 'KOOBOO_DEFAULT_FILE'

export async function exportAction(options: ExportActionOptions) {
  const authorized = await ensureLogin(options)
  if (!authorized) {
    return
  }

  // 1. Get StoreNames
  const client = site.getSiteClient()
  const { data: storeNames } = await client.get<ExportStoreNameDto[]>('Site/ExportStoreNames')
  const questions: DistinctQuestion[] = []
  if (!options.file) {
    questions.push({
      type: 'input',
      name: 'file',
      message: 'Specify the file name to export',
      default: process.env[fileEnvName] || 'site.zip'
    })
  }
  const defaultExports = process.env[exportEnvName]?.split(',') || ['Code', 'Script', 'Style']
  questions.push({
    type: 'checkbox',
    name: 'storeNames',
    message: 'Select store names to export',
    choices: storeNames.map((item) => ({
      name: item.displayName,
      value: item.name,
      checked: defaultExports.includes(item.name)
    }))
  })
  // save settings or not
  questions.push({
    type: 'confirm',
    name: 'save',
    message: 'Save store names to settings',
    default: false
  })

  const answers = (await inquirer.prompt(questions)) as ExportAnswers

  // 2. Export Site
  if (answers.storeNames?.length) {
    const stores = answers.storeNames.join(',')
    const copyMode = 'normal'
    const { data: exportfile } = await client.get('Site/ExportStoreGenerate', {
      params: {
        stores,
        copyMode
      }
    })
    const response = await client.get('Site/ExportStore', {
      responseType: 'stream',
      params: {
        copyMode,
        exportfile
      }
    })
    let file = answers.file || 'site.zip'
    if (!file.endsWith('.zip')) {
      file += '.zip'
    }
    await downloadFile(response, file)
  }

  // 3. Save settings to .env
  if (answers.save) {
    const envFile = resolve(process.cwd(), '.env')
    upsertLine(envFile, `${exportEnvName}=${answers.storeNames.join(',')}`, (line) =>
      line.startsWith(exportEnvName)
    )
    upsertLine(envFile, `${fileEnvName}=${answers.file}`, (line) => line.startsWith(fileEnvName))

    ora().succeed(`Settings saved to ${envFile}`)
  }
}

async function downloadFile(response: any, filename: string) {
  const downloadSpinner = ora(`Downloading file ${filename}...`).start()
  const writer = createWriteStream(filename)
  response.data.pipe(writer)

  return new Promise((res, rej) => {
    writer.on('finish', () => {
      downloadSpinner.succeed(`File ${filename} downloaded successfully!`)
      res(filename)
    })
    writer.on('error', (error) => {
      downloadSpinner.fail(`Failed to download file ${filename}!\n${error}`)
      rej(error)
    })
  })
}
