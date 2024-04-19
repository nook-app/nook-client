import { makeRequestJson } from './util'

export const getDegenAllowance = (): Promise<{ remaining: string; total: string }> => {
  return makeRequestJson(`/tips/degen/allowance`)
}
