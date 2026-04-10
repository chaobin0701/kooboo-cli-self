import ora from 'ora'

export type RetryOptions<T> = {
  attempts?: number
  message: string
  successMessage: (result: T) => string
  failureMessage: (attempt: number, attempts: number, error: unknown) => string
  finalFailureMessage?: (attempts: number, error: unknown) => string
}

export async function retryWithLimit<T>(
  action: () => Promise<T>,
  options: RetryOptions<T>
): Promise<T | null> {
  const attempts = options.attempts ?? 3

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const spinner = ora(
      attempts > 1 ? `${options.message} (${attempt}/${attempts})` : options.message
    ).start()

    try {
      const result = await action()
      spinner.succeed(options.successMessage(result))
      return result
    } catch (error) {
      const isLastAttempt = attempt === attempts
      const message = isLastAttempt && options.finalFailureMessage
        ? options.finalFailureMessage(attempts, error)
        : options.failureMessage(attempt, attempts, error)
      spinner.fail(message)
    }
  }

  return null
}
