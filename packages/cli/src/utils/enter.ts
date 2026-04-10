import { input, password as passwordInput, select } from '@inquirer/prompts'
import ora from 'ora'

export async function enterUsernameAndPassword(options?: { username?: string; password?: string }) {
  let username = options?.username || process.env.KOOBOO_USERNAME
  while (!username) {
    username = await input({ message: 'Please enter your username: ' })
    if (!username) {
      ora('Username is required').warn()
    }
  }
  let password = options?.password || process.env.KOOBOO_PASSWORD
  while (!password) {
    password = await passwordInput({ message: 'Please enter your password: ' })
    if (!password) {
      ora('Password is required').warn()
    }
  }

  return { username, password }
}

export async function enterSiteName() {
  let siteName = ''
  while (!siteName) {
    siteName = await input({ message: 'Please enter the site name' })
    if (!siteName) {
      ora('Site name is required').warn()
    }
  }
  return siteName
}

export async function selectProjectTemplate() {
  const template = await select({
    message: 'Please select the project template',
    choices: [
      { name: 'Empty Template', value: '@kooboo/template-empty' },
      { name: 'Vitest Template', value: '@kooboo/template-vitest' },
      { name: 'Default Template', value: '@kooboo/template-default' }
    ]
  })
  return template
}
