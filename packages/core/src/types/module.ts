export type ModuleItem = {
  packageName: string
  moduleVersion: number | null
  relativeFolder: string | null
  startView: string | null
  settings: any
  lastModified: string
  name: string
  backendViewUrl: string | null
  online: boolean
  id: string
}

export type ModuleResourceType =
  | 'css'
  | 'js'
  | 'view'
  | 'api'
  | 'img'
  | 'file'
  | 'backend'
  | 'code'
  | 'root'

export type ModuleFile = {
  objectType: ModuleResourceType
  isText: boolean
  isBinary: boolean
  name: string
  fullName: string
  folderName: string
  extension: string
  size: number
  stringSize: string
  lastModified: string
  fileContentType: string
  previewUrl: string
}

export type ModuleResource = {
  content: string
  fileName: string
  folder: string
  moduleName: string
  moduleid?: string
  objectType: ModuleResourceType
}

export type GetModuleResource = Omit<ModuleResource, 'content'>
