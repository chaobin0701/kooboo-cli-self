import { declare } from '@babel/helper-plugin-utils'
import { transformKoobooPathToLocal, transformLocalPathToKooboo } from '../utils/path.js'
import { ExportAllDeclaration, ExportDeclaration, ExportNamedDeclaration } from '@babel/types'

const koobooImportPathTransformToLocalPlugin = declare(
  (
    api,
    options: {
      target: 'local' | 'kooboo'
      alias?: Record<string, string>
      filename?: string
    }
  ) => {
    api.assertVersion(7)
    const { target, alias, filename } = options
    return {
      visitor: {
        Program: {
          enter(path) {
            path.traverse({
              ImportDeclaration(path) {
                const importPath = path.node.source.value
                let newPath = ''
                if (target === 'local') {
                  newPath = transformKoobooPathToLocal(importPath, alias)
                } else {
                  newPath = transformLocalPathToKooboo(importPath, { alias, filename })
                }
                path.node.source.value = newPath
              },
              ExportDeclaration(path) {
                if ('source' in path.node) {
                  const node = path.node as ExportAllDeclaration | ExportNamedDeclaration
                  if (node.source) {
                    const exportPath = node.source?.value
                    if (exportPath) {
                      let newPath = ''
                      if (target === 'local') {
                        newPath = transformKoobooPathToLocal(exportPath, alias)
                      } else {
                        newPath = transformLocalPathToKooboo(exportPath, { alias, filename })
                      }
                      node.source.value = newPath
                    }
                  }
                }
              },
              ExpressionStatement(path) {
                // 处理 k.import('filename')
                const expression = path.node.expression
                if (expression.type === 'CallExpression') {
                  const callee = expression.callee
                  if (
                    callee.type === 'MemberExpression' &&
                    callee.object.type === 'Identifier' &&
                    callee.object.name === 'k' &&
                    callee.property.type === 'Identifier' &&
                    callee.property.name === 'import'
                  ) {
                    const argument = expression.arguments[0]
                    if (argument.type === 'StringLiteral') {
                      const importPath = argument.value
                      let newPath = ''
                      if (target === 'local') {
                        newPath = importPath.split('.').join('/')
                      } else {
                        newPath = importPath.split('/').join('.')
                      }
                      argument.value = newPath
                    }
                  }
                }
              }
            })
          }
        }
      }
    }
  }
)

export default koobooImportPathTransformToLocalPlugin
