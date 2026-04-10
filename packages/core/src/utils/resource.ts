import { ResourceMetadata } from '../types/context.js'

export function resourceListToMap<T extends keyof ResourceMetadata>(
  data: ResourceMetadata[T][string][]
) {
  return data.reduce((acc, item) => {
    acc[item.name] = item
    return acc
  }, {} as Record<string, ResourceMetadata[T][string]>)
}
