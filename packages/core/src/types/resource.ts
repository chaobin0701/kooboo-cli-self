import { Code } from './code.js'
import { Layout } from './layout.js'
import { Page } from './page.js'
import { View } from './view.js'
import { Style } from './style.js'
import { Script } from './script.js'

export type Resource = {
  api: Code<'Api'>
  codeblock: Code<'CodeBlock'>
  pagescript: Code<'PageScript'>
  layout: Layout
  page: Page
  view: View
  style: Style
  script: Script
}

export type ResourceType = keyof Resource
