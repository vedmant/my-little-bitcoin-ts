import { writable, derived } from 'svelte/store'

export const loading = writable(false)
export const mining = writable(false)
export const demoMode = writable(false)
export const time = writable([])
export const chain = writable([])
export const mempool = writable([])
export const wallets = writable([])
export const stats = writable([])
export const block = writable({})
export const address = writable({})
export const transaction = writable({ transaction: { inputs: [], outputs: [] }, block: {} })

/*
 * Getters
 */

export const blockOutput = derived(block, $block => {
  if (!$block.transactions || !$block.transactions.length) return ''

  return $block.transactions.reduce((acc, tx) => acc + tx.outputs.reduce((acc, out) => acc + out.amount, 0), 0)
})

export const blockReward = derived(block, $block => {
  if (!$block.transactions || !$block.transactions.length) return ''

  return $block.transactions.find(tx => tx.reward).outputs[0].amount
})

/*
 * Actions
 */

export const addBlock = (block) => {
  chain.update(c => {
    c.push(block)
    c = c.slice(Math.max(c.length - 5, 0))

    return c
  })

  cleanMempool(block.transactions)
}

export const cleanMempool = (transactions) => {
  transactions.forEach(tx => {
    mempool.update(mpl => {
      let index = mpl.findIndex(t => t.id === tx.id)
      if (index !== -1) mpl.splice(index, 1)

      return mpl
    })
  })
}

export const updateBalance = (balance) => {
  wallets.update(wlts => {
    const index = wlts.findIndex(w => w.public === balance.public)
    if (index === -1) return console.error('Cant find wallet to update balance')
    wlts[index].balance = balance.balance

    return wlts
  })
}
