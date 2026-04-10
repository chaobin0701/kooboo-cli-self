import PostHTML from 'posthtml'

interface HtmlTransformResult {
  html: string
  config: Record<string, string>
}

export type CompileHtmlConfig = Record<string, string>

export function compileHtml(
  source: string,
  target: 'kooboo'
): HtmlTransformResult
export function compileHtml(
  source: string,
  target: 'local',
  config?: CompileHtmlConfig
): HtmlTransformResult
export function compileHtml<T extends 'kooboo' | 'local'>(
  source: string,
  target: T,
  config?: CompileHtmlConfig
): HtmlTransformResult {
  const pageConfig: Record<string, string> = {}

  const result = PostHTML()
    .use(tree => {
      if (target === 'kooboo') {
        // 处理根级的注释节点
        if (Array.isArray(tree)) {
          // 收集要移除的节点索引
          const nodesToRemove: number[] = []

          tree.forEach((node, index) => {
            // 处理注释节点
            if (
              typeof node === 'object' &&
              node.tag === 'comment' &&
              node.content
            ) {
              const commentText = String(node.content).trim()
              if (commentText.startsWith('@k-')) {
                const configMatch = commentText.match(
                  /@k-([a-zA-Z0-9-]+)\s+(.+)/
                )
                if (configMatch) {
                  const [, key, value] = configMatch
                  pageConfig[key] = value.trim()
                  nodesToRemove.push(index)
                }
              }
            } else if (
              typeof node === 'string' &&
              node.trim().startsWith('<!--') &&
              node.trim().endsWith('-->')
            ) {
              // 处理字符串形式的注释
              const commentText = node.trim().replace(/<!--\s*|\s*-->/g, '')
              if (commentText.startsWith('@k-')) {
                const configMatch = commentText.match(
                  /@k-([a-zA-Z0-9-]+)\s+(.+)/
                )
                if (configMatch) {
                  const [, key, value] = configMatch
                  pageConfig[key] = value.trim()
                  nodesToRemove.push(index)
                }
              }
            }
          })

          // 从后向前移除节点（避免索引变化）
          nodesToRemove
            .sort((a, b) => b - a)
            .forEach(index => {
              tree.splice(index, 1)
            })
        }
      } else if (target === 'local' && config) {
        if (Array.isArray(tree)) {
          const configKVList = Object.entries(config as CompileHtmlConfig)
          const configStrList = configKVList.map(([key, value]) => {
            const configStr = `<!-- @k-${key} ${value} --> \n`
            return configStr
          })
          tree.unshift(...configStrList)
        }
      }

      return tree
    })
    .use(tree => {
      // 处理view标签的id属性
      tree.match([{ tag: 'view' }, { tag: 'layout' }], node => {
        if (node.attrs && node.attrs.id) {
          if (target === 'kooboo') {
            node.attrs.id = node.attrs.id.replace(/\//g, '.')
          } else {
            node.attrs.id = node.attrs.id.replace(/\./g, '/')
          }
        }
        return node
      })

      return tree
    })
    .use(tree => {
      // 将自闭合标签转换为双标签
      tree.walk(node => {
        if (typeof node === 'object' && node.tag) {
          // 检查是否为自闭合标签（没有content或content为空）
          if (
            !node.content ||
            (Array.isArray(node.content) && node.content.length === 0)
          ) {
            // 确保content是一个空数组，这样PostHTML会将其渲染为双标签
            node.content = []
          }
        }
        return node
      })

      return tree
    })
    .process(source?.trim() || '', { sync: true })

  return {
    html: (result as any)?.html || '',
    config: pageConfig
  }
}
