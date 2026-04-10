import { declare } from '@babel/helper-plugin-utils'
import { PluginPass, NodePath } from '@babel/core'
import { Comment, type Program } from '@babel/types'

interface ExtractedConfig {
  [key: string]: string
}

interface FileMetadata {
  extractedConfig?: ExtractedConfig
}

interface CommentBlock {
  value: string
  type: 'CommentBlock' | 'CommentLine'
}

interface FileState {
  file: {
    metadata: FileMetadata
  }
}

type Options =
  | {
      target: 'kooboo'
    }
  | {
      target: 'local'
      config: {
        [key: string]: string
      }
    }

const extractionConfigPlugin = declare((api, options: Options) => {
  api.assertVersion(7)
  const config = Object.assign({}, 'config' in options ? options.config : {})
  return {
    visitor: {
      Program: {
        enter(
          path: NodePath<Program>,
          state: PluginPass & { extractedConfig?: ExtractedConfig }
        ) {
          // Initialize the extractedConfig object in state
          state.extractedConfig = {}

          let comments: Comment[]
          if (!path.node.body[0]) {
            if (!path.node.innerComments) {
              path.node.innerComments = []
            }
            comments = path.node.innerComments
          } else {
            if (!path.node.body[0]?.leadingComments) {
              path.node.body[0].leadingComments = []
            }
            comments = path.node.body[0].leadingComments
          }

          // Process each comment to find those matching our pattern
          comments.forEach((comment: CommentBlock) => {
            const commentText = comment.value.trim()
            const match = commentText.match(/^@k-(\w+)\s+(.+)$/)

            if (match) {
              const [, key, _value] = match
              if (!state.extractedConfig![key]) {
                const value = _value.trim()
                state.extractedConfig![key] = value
                if (options.target === 'local') {
                  if (config[key]) {
                    if (config[key] !== value) {
                      comment.value = `@k-${key} ${config[key]}`
                    }
                    delete config[key]
                  }
                }
              }
            }
          })
          if (options.target === 'local') {
            Object.entries(config).forEach(([key, value]) => {
              comments.unshift({
                value: `@k-${key} ${value}`,
                type: 'CommentLine'
              })
            })
          }
        },
        exit(
          path: NodePath<Program>,
          state: PluginPass & { extractedConfig?: ExtractedConfig }
        ) {
          // Store the extracted parameters in file.metadata to make it available
          // after transformation
          ;(path.hub as unknown as FileState).file.metadata.extractedConfig =
            state.extractedConfig
        }
      }
    }
  }
})

export default extractionConfigPlugin
