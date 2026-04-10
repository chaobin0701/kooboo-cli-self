import Table from 'cli-table3'

export type ResourceType =
  | 'api'
  | 'codeblock'
  | 'module'
  | 'layout'
  | 'page'
  | 'view'
  | 'script'
  | 'style'

export const Resources: ResourceType[] = [
  'api',
  'codeblock',
  'module',
  'layout',
  'page',
  'view',
  'script',
  'style'
]

/**
 * 获取schematics介绍表格
 */
export function getResourcesTable() {
  const table = new Table({
    head: ['name', 'description']
  })

  table.push(
    ['api', 'Generate a backend API endpoint file in Api directory'],
    ['codeblock', 'Generate a backend code block file in CodeBlock directory'],
    ['module', 'Generate a kooboo module in the Module directory'],
    [
      'layout',
      'Generate a kooboo front-end layout file in the Layout directory'
    ],
    ['page', 'Generate a kooboo front-end page file in the Page directory'],
    [
      'view',
      'Generate a kooboo front-end view component file in the View directory'
    ],
    ['script', 'Generate a front-end js file in the Script directory'],
    ['style', 'Generate a front-end css file in the Style directory']
  )
  return table.toString()
}

/**
 * resource
 */
export function checkResource(resource: string): boolean {
  return Resources.includes(resource as ResourceType)
}
