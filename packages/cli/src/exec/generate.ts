import ora from 'ora'

export function generateAction(resource: string, name: string, options: any) {
  ora(
    `Generate is not available yet for ${resource}/${name}. Use kbs new, kbs clone, kbs pull, or kbs sync instead.`
  ).fail()
  process.exitCode = 1
}
