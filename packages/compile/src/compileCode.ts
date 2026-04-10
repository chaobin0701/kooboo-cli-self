import { transform, type GeneratorOptions } from '@babel/core'
import extractionConfigPlugin from './babel-plugins/extractionConfig.js'
import transformPathPlugin from './babel-plugins/transformPath.js'

interface CompileCodeOptions {
  alias?: Record<string, string>
  filename?: string
  // 代码格式化选项
  generateOptions?: GeneratorOptions
  config?: Record<string, string>
}

export interface CompileCodeResult {
  code: string
  config?: Record<string, string>
}

export function compileCode(
  source: string,
  target: 'kooboo' | 'local' | 'localModule',
  options?: CompileCodeOptions
): CompileCodeResult {
  try {
    const result = transform(source, {
      sourceType: 'module',
      parserOpts: {
        plugins: ['typescript'],
        errorRecovery: true,
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true,
        allowUndeclaredExports: true,
        allowSuperOutsideMethod: true,
        allowNewTargetOutsideFunction: true,
        strictMode: false
      },
      plugins: [
        [transformPathPlugin, { target, alias: options?.alias, filename: options?.filename }],
        [extractionConfigPlugin, { target, config: options?.config }]
      ],
      filename: options?.filename,
      // 代码生成器选项
      generatorOpts: options?.generateOptions
    })

    // 处理结果
    if (!result || !result.code) {
      return { code: source } // 如果没有生成代码，返回原始代码
    }

    // 提取参数
    const extractedConfig = (result.metadata as any)?.extractedConfig || {}

    return {
      code: result.code,
      config: extractedConfig
    }
  } catch (error: any) {
    // 优化错误输出，只显示关键信息
    if (error.code === 'BABEL_PARSE_ERROR') {
      const { reasonCode, loc, message } = error

      // 提取原始错误消息中的文件名和代码片段
      const errorLines = message.split('\n').slice(0, 6)

      console.error(`Babel 解析错误 (${reasonCode}):`)
      console.error(`位置: 第 ${loc?.line || '?'} 行, 第 ${loc?.column || '?'} 列`)
      console.error(errorLines.join('\n'))

      console.error('\n transform options: \n', options)
    } else {
      console.error(`${error.message || error}`)
    }
    const commentConfig = extractCommentConfig(source)
    const importSyntax = extractImportPath(source)

    return { code: source, config: commentConfig }
  }
}

function extractCommentConfig(source: string) {
  const comments: Record<string, string> = {}
  const commentRegex = /\/\/\s*@k-(\w+)\s+(.+)$/gm
  let match
  while ((match = commentRegex.exec(source)) !== null) {
    comments[match[1]] = match[2].trim()
  }

  return comments
}

function extractImportPath(source: string) {
  const imports: Record<string, number> = {}
  const importRegex = /import\s+(?:[\w\s{},*]+from\s+)?['"]([^'"]+)['"]/g
  let importMatch
  while ((importMatch = importRegex.exec(source)) !== null) {
    const importPath = importMatch[1]
    imports[importPath] = importRegex.lastIndex
  }

  return imports
}
