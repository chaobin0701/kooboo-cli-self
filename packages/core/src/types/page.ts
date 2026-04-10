export interface Meta {
  charset?: string
  property?: string
  content?: Record<string, string>
  httpequiv?: string
  name?: string
  el?: Element
}

// export interface Page {
//   id: string
//   inlineUrl: string
//   lastModified: string
//   layoutId: string
//   linked: number
//   name: string
//   online: boolean
//   path: string
//   previewUrl: string
//   type: string
//   startPage: boolean
//   relations: { htmlBlock: number; layout: number; menu: null; view: number }
//   hasParameter?: boolean
//   title: string
// }

export interface Page {
  previewUrl?: string
  contentTitle?: Record<string, string>
  urlPath: string
  metas?: Meta[]
  parameters?: Record<string, string>
  body: string
  designConfig?: string
  name: string
  id: string
  enableCache?: boolean
  disableUnocss?: boolean
  cacheVersionType?: number
  cacheByVersion?: boolean
  cacheByDevice?: boolean
  cacheByCulture?: boolean
  cacheMinutes?: number
  cacheQueryKeys?: string
  title?: string
  baseUrl?: string
  scripts?: string[]
  styles?: string[]
  version: number
  enableDiffChecker: boolean
  layoutName?: string
  published?: boolean
  placeholderContents?: string
  metaBindings?: string[]
  urlParamsBindings?: string[]
  type?: 'Normal' | 'Layout' | 'RichText' | 'Designer'
  layoutId?: string
}

export interface PageItem {
  id: string
  name: string
  title: string | null
  warning: number
  linked: number
  pageView: number
  layoutId: string
  online: boolean
  lastModified: string
  path: string
  previewUrl: string
  inlineUrl: string
  startPage: boolean
  relations: {}
  type: 'Normal'
  hasParameter: boolean
}
