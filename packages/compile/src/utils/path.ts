export function transformLocalPathToKooboo(
  path: string,
  options: { alias?: Record<string, string>; filename?: string }
) {
  const { alias, filename } = options
  const pathParts = path.split('/').filter((p) => p !== '.')
  const type = pathParts.shift() as string
  if (type === 'module') {
    return `module:${pathParts.join('.')}`
  } else if (path.startsWith('.') && filename?.includes('/code/')) {
    return handleRelativePath(path, filename)
  } else {
    if (alias) {
      const aliasPaths = Object.keys(alias).sort((a, b) => b.length - a.length)
      for (const aliasPath of aliasPaths) {
        if (path.startsWith(aliasPath)) {
          const aliasPathValue = alias[aliasPath]
          return `${aliasPathValue}${path.slice(aliasPath.length)}`
        }
      }
    }
    return `./${pathParts.join('.')}`
  }
}

export function transformKoobooPathToLocal(path: string, alias?: Record<string, string>) {
  if (path.startsWith('module:')) {
    const moduleImportPath = path.slice(7)
    return `module/${moduleImportPath}`
  } else {
    const codeImportPath = path.slice(2)
    return `code/${codeImportPath.split('.').join('/')}`
  }
}

export const handleRelativePath = (path: string, filename: string) => {
  const pathParts = path.split('/').filter((p) => p !== '.')
  let parentNum = 0
  for (const part of pathParts) {
    if (part == '..') {
      parentNum++
    } else {
      break
    }
  }
  const restPathParts = pathParts.slice(parentNum)

  const filenameParts = filename.split('/')
  const codeIndex = filenameParts.indexOf('code')
  const codePathParts = filenameParts.slice(codeIndex + 1)

  const newPathParts = [...codePathParts.slice(0, -(parentNum + 1)), ...restPathParts]
  return `./${newPathParts.join('.')}`
}
