#!/usr/bin/env node
import { config } from 'dotenv'

import { Command } from 'commander'

import fse from 'fs-extra'
import path from 'node:path'
import ora from 'ora'
import { fileURLToPath } from 'node:url'

import { getResourcesTable } from './utils/resources'
import { generateAction } from './exec/generate'
import { createAction } from './exec/create'
import { cloneAction } from './exec/clone'
import { syncAction } from './exec/sync'
import { pullAction } from './exec/pull'
import { pushAction } from './exec/push'
import { deployAction } from './exec/deploy'
import { configAction } from './exec/config'
import {
  importLabelAction,
  pullLabelAction,
  setLabelAction,
  showLabelAction
} from './exec/label'
import { exportAction } from './exec/export'
import type { SyncActionOptions, ExportActionOptions } from './types'

config({ override: true })

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.on('unhandledRejection', (reason) => {
  // Check if it's an Inquirer exit error (from Ctrl+C)
  if (
    reason instanceof Error &&
    reason.name === 'ExitPromptError' &&
    reason.message.includes('User force closed the prompt')
  ) {
    ora('Operation cancelled').fail()
    process.exit(0)
  }

  // For other unhandled errors, log them
  console.error('Unhandled rejection:', reason)
  process.exit(1)
})

const pkgJson = fse.readJSONSync(path.join(__dirname, '../package.json'))

const program = new Command()

program
  .name('kooboo-cli')
  .description('CLI tool for Kooboo local development')
  .version(pkgJson.version)
// .addHelpText(
//   'afterAll',
//   `Schematics available for generate command: \n${getResourcesTable()}`
// )

const configCommand = program
  .command('config')
  .arguments('[key] [value]')
  .description('Set or get configuration values')
  .option('-g, --global', 'Set configuration value globally')
  .option('-s, --site-url <url>', 'Specify the Kooboo site URL for site config commands')
  .option('-u, --username <username>', 'Specify the Kooboo username for site config commands')
  .option('-p, --password <password>', 'Specify the Kooboo password for site config commands')
  .action(configAction)
  .addHelpText(
    'after',
    `
Site config commands:
  kbs config site pull
  kbs config site push
  kbs config site show
`
  )

const labelCommand = program
  .command('label')
  .description('Manage Kooboo labels')

labelCommand
  .command('pull')
  .description('Pull remote labels to local cache')
  .option('-s, --site-url <url>', 'Specify the Kooboo site URL')
  .option('-u, --username <username>', 'Specify the Kooboo username')
  .option('-p, --password <password>', 'Specify the Kooboo password')
  .action((options) => {
    return pullLabelAction(options)
  })

labelCommand
  .command('show')
  .description('Show local label cache')
  .action(() => {
    showLabelAction()
  })

labelCommand
  .command('set')
  .description('Create or overwrite a single label')
  .argument('<key>', 'Specify the label key')
  .option('-v, --values <json>', 'Specify multilingual values as a JSON string')
  .option('-s, --site-url <url>', 'Specify the Kooboo site URL')
  .option('-u, --username <username>', 'Specify the Kooboo username')
  .option('-p, --password <password>', 'Specify the Kooboo password')
  .action((key, options) => {
    return setLabelAction(key, options)
  })

labelCommand
  .command('import')
  .description('Import labels from a JSON file')
  .argument('<file>', 'Specify the label JSON file to import')
  .option('-s, --site-url <url>', 'Specify the Kooboo site URL')
  .option('-u, --username <username>', 'Specify the Kooboo username')
  .option('-p, --password <password>', 'Specify the Kooboo password')
  .action((file, options) => {
    return importLabelAction(file, options)
  })

// create
program
  .command('new')
  .alias('n')
  .description('Create a new Kooboo site')
  .argument('[name]', 'Specify the name of the new Kooboo site')
  .option('-h, --host <host>', 'Specify the Kooboo server host')
  .action(createAction)

// clone
program
  .command('clone')
  .alias('c')
  .description('Clone a remote Kooboo site')
  .argument('<siteUrl>', 'Specify the site url to clone')
  .argument('[dir]', 'Specify the target directory')
  .option('-u, --username <username>', 'Specify the Kooboo username')
  .option('-p, --password <password>', 'Specify the Kooboo password')
  .action((siteUrl, dir, options) =>
    cloneAction({
      site: siteUrl,
      dir,
      username: options.username,
      password: options.password
    })
  )

// pull
program
  .command('pull')
  .description('Pull remote Kooboo site code to local environment')
  .argument('[resource]', 'Specify the resource type to pull')
  .argument('[name]', 'Specify the resource name to pull')
  .action(pullAction)
  .addHelpText('after', `Resources available: \n${getResourcesTable()}`)

program
  .command('push')
  .description('Push local Kooboo site code to remote environment in batch')
  .argument('[resource]', 'Specify the resource type to push')
  .argument('[name]', 'Specify the resource name to push')
  .action(pushAction)
  .addHelpText('after', `Resources available: \n${getResourcesTable()}`)

program
  .command('deploy')
  .description('Deploy files, folders, or globs to remote Kooboo site')
  .argument('<files...>', 'Specify one or more local files to deploy')
  .option('-s, --site-url <url>', 'Specify the Kooboo site URL')
  .option('-u, --username <username>', 'Specify the Kooboo username')
  .option('-p, --password <password>', 'Specify the Kooboo password')
  .action((files, options) => {
    deployAction(files, options)
  })

// generate
program
  .command('generate')
  .alias('g')
  .description('Generate Kooboo code resources placeholder')
  .arguments('<resource> <name> [options]')
  .action(generateAction)
  .addHelpText('after', `Resources available: \n${getResourcesTable()}`)

// sync
program
  .command('sync')
  .description('Continuously synchronize Kooboo site code to server environment')
  .option('-s, --site-url <url>', 'Specify the Kooboo site URL')
  .option('-u, --username <username>', 'Specify the Kooboo username')
  .option('-p, --password <password>', 'Specify the Kooboo password')
  .option('-i, --init', 'Initialize synchronization of all code to server')
  .option(
    '-c, --common-module-path <path>',
    'Specify the common module path to sync to each module.'
  )
  .action((options: SyncActionOptions) => {
    syncAction(options)
  })

// export
program
  .command('export')
  .description('Export Kooboo site resources to zip file')
  .option('-s, --site-url <url>', 'Specify the Kooboo site URL')
  .option('-u, --username <username>', 'Specify the Kooboo username')
  .option('-p, --password <password>', 'Specify the Kooboo password')
  .option('-f, --file <file>', 'Specify the zip file path')
  .action((options: ExportActionOptions) => {
    exportAction(options)
  })

program.parse()
