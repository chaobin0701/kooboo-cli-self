import ora from 'ora'
import fse from 'fs-extra'
import { resolve } from 'path'
import { installDependencies, type PackageManager } from './package-manager'
import { upsertLine } from './writeFile'

export async function installUnitTesting(targetPath: string, packageManager: PackageManager) {
  const installSpinner = ora('Installing unit testing dependencies...').start()
  try {
    // 1. install vitest & @kooboo/vitest-plugin
    await installDependencies(
      targetPath,
      packageManager,
      ['vitest', '@kooboo/vitest-plugin', '@types/node'],
      true
    )

    // 2. prepare tsconfig.json
    const testsDir = resolve(targetPath, 'tests')
    fse.mkdirSync(testsDir)
    fse.writeJsonSync(
      resolve(testsDir, 'tsconfig.json'),
      {
        compilerOptions: {
          paths: {
            '@/*': ['../src/*']
          },
          types: ['../kooboo.d.ts']
        }
      },
      {
        spaces: 2,
        encoding: 'utf-8'
      }
    )

    // 3. prepare vitest config
    const vitestConfig = `import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";
import koobooPlugin from "@kooboo/vitest-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.spec.ts"],
    setupFiles: ["tests/kooboo.setup.ts"],
  },
  plugins: [koobooPlugin()],
});
`
    fse.writeFileSync(resolve(targetPath, 'vitest.config.ts'), vitestConfig)

    // 4. update package.json
    const packageJson = fse.readJsonSync(resolve(targetPath, 'package.json'))
    packageJson.scripts.test = 'vitest'
    fse.writeJsonSync(resolve(targetPath, 'package.json'), packageJson, {
      spaces: 2,
      encoding: 'utf-8'
    })

    // 5. prepare example unit test spec
    const example = `import { describe, it, expect, vi } from 'vitest'

describe('example', () => {
  it('makeAbsUrl should work', () => {
    vi.spyOn(k.site.info, 'makeAbsUrl').mockImplementation(
      (relativePath) => \`https://example.com\${relativePath}\`
    )

    expect(k.site.info.makeAbsUrl('/test')).toBe('https://example.com/test')
  })
})
`
    fse.writeFileSync(resolve(testsDir, 'example.spec.ts'), example)

    // 6. append .gitignore
    upsertLine(
      resolve(targetPath, '.gitignore'),
      '# @kooboo/vitest-plugin\nkooboo.setup.ts',
      (line) => line?.trim() === 'kooboo.setup.ts'
    )

    installSpinner.succeed('Unit testing dependencies installed successfully!')
  } catch (error) {
    installSpinner.fail(`Failed to install unit testing dependencies: ${error}`)
  }
}
