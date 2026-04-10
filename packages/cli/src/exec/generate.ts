import ora from 'ora'

export function generateAction(resource: string, name: string, options: any) {
  ora(
    `Generate is not available yet for ${resource}/${name}. Use kb new, kb clone, kb pull, or kb sync instead.`
  ).fail()
  process.exitCode = 1
}
