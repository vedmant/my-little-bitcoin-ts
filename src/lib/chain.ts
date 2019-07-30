import { Block, checkBlock } from './block'

export function isChainValid (chain: Block[], difficulty: number) {
  for (let i = 1; i < chain.length; i++) {
    // TODO
    // if (! checkBlock(chain[i - 1], chain[i], difficulty)) {
    //   return false
    // }
  }

  return true
}
