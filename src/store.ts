import Bus from './bus';
import { generateKeyPair, Wallet } from './lib/wallet'
import { GeneralError, TransactionError } from './errors'
import { isChainValid } from './lib/chain'
import { Block, checkBlock, makeGenesisBlock } from './lib/block'
import { buildTransaction, checkTransaction, Input, Output, Transaction } from './lib/transaction'
import Debug from 'debug'

const debug = Debug('app:store')

export default class Store {

  bus: Bus
  difficulty: number // The less value the bigger difficulty
  chain: any[]
  mempool: Array<any> // This is pending transactions that will be added to the next block
  peers: Array<any> // List of peers ['ip:port']
  wallets: Wallet[]
  mining: boolean

  constructor(config: any, bus: Bus) {
    this.bus = bus
    this.difficulty = config.demoMode ? 100000000 : 10000 * 1
    this.chain = [makeGenesisBlock()]
    this.mempool = []
    this.peers = config.initialPeers
    this.wallets = [
      {name: 'Main', ...generateKeyPair()},
      {name: 'Wallet 1', ...generateKeyPair()},
      {name: 'Wallet 2', ...generateKeyPair()},
      {name: 'Wallet 3', ...generateKeyPair()},
    ]
    this.mining =  !! config.demoMode
  }

  /* ========================================================================= *\
   * Getters
  \* ========================================================================= */

  lastBlock () {
    return this.chain[this.chain.length - 1]
  }

  blocksAfter (index: number) {
    if (index >= this.chain.length) return []
    return this.chain.slice(index)
  }

  getTransactions (withMempool = true) {
    let transactions = this.chain.reduce((transactions, block) => transactions.concat(block.transactions), [])
    if (withMempool) transactions = transactions.concat(this.mempool)

    return transactions
  }

  getTransactionsForAddress (address: string) {
    return this.getTransactions(false).filter(
      (tx: Transaction) => tx.inputs.find(i => i.address === address)
        || tx.outputs.find(o => o.address === address))
  }

  getTransactionsForNextBlock () {
    const unspent = this.getUnspent(false)
    return this.mempool.filter(tx => {
      try {
        return checkTransaction(tx, unspent)
      } catch (e) { if (! (e instanceof TransactionError)) throw e }
    })
  }

  getUnspent (withMempool = false) {
    const transactions = this.getTransactions(withMempool)

    // Find all inputs with their tx ids
    const inputs = transactions.reduce((inputs: Input[], tx: Transaction) => inputs.concat(tx.inputs), [])

    // Find all outputs with their tx ids
    const outputs = transactions.reduce((outputs: Output[], tx: Transaction) =>
      outputs.concat(tx.outputs.map(o => Object.assign({}, o, {tx: tx.id}))), [])

    // Figure out which outputs are unspent
    return outputs.filter((output: Output) =>
      typeof inputs.find((input: Input) => input.tx === output.tx && input.index === output.index && input.amount === output.amount && input.address === output.address) === 'undefined')
  }

  getUnspentForAddress (address: string) {
    return this.getUnspent(true).filter((u: Output) => u.address === address)
  }

  getBalanceForAddress (address: string) {
    return this.getUnspentForAddress(address).reduce((acc: number, u: Output) => acc + u.amount, 0)
  }

  /* ========================================================================= *\
   * Actions
  \* ========================================================================= */

  addBlock (block: Block) {
    checkBlock(this.lastBlock(), block, this.difficulty, this.getUnspent())
    this.chain.push(block) // Push block to the chain
    this.cleanMempool(block.transactions) // Clean mempool
    debug(`Added block ${block.index} to the chain`)
    return block
  }

  addTransaction (transaction: Transaction, byPeer = false) {
    checkTransaction(transaction, this.getUnspent(true))
    // TODO: check if transaction or any intputs are not in mempool already
    this.mempool.push(transaction)

    if (byPeer) this.bus.emit('transaction-added', transaction)
    else this.bus.emit('transaction-added-by-me', transaction)

    // Notify about new transaction if one of our wallets recieved funds
    let myWallet: Wallet
    const outputToMyWallet = transaction.outputs.find(output => myWallet = this.wallets.find(w => w.public === output.address))
    if (myWallet && outputToMyWallet) {
      this.bus.emit('recieved-funds', {
        name: myWallet.name,
        public: myWallet.public,
        amount: outputToMyWallet.amount,
        balance: this.getBalanceForAddress(myWallet.public),
      })
    }
    debug('Added transaction to mempool ', transaction.id)
  }

  addWallet (wallet: Wallet) {
    this.wallets.push(wallet)
  }

  cleanMempool (transactions: Transaction[]) {
    transactions.forEach(tx => {
      const index = this.mempool.findIndex(t => t.id === tx.id)
      if (index !== -1) this.mempool.splice(index, 1)
    })
  }

  updateChain (newChain: Block[]) {
    if (newChain.length > this.chain.length && isChainValid(newChain, this.difficulty)) {
      this.chain = newChain
      return true
    }

    return false
  }

  // addPeer (peer) {
  //   this.peers.push(peer)
  // }

  send (from: string, toAddress: string, amount: number) {
    const wallet = this.wallets.find(w => w.public === from)
    if (! wallet) throw new GeneralError(`Wallet with address ${from} not found`)
    if (amount <= 0) throw new GeneralError(`Amount should be positive`)

    try {
      const transaction = buildTransaction(wallet, toAddress, amount, this.getUnspentForAddress(wallet.public))
      this.addTransaction(transaction)
      this.bus.emit('balance-updated', {public: wallet.public, balance: this.getBalanceForAddress(wallet.public)})
      return 'Transaction added to pool: ' + transaction.id
    } catch (e) {
      if (! (e instanceof TransactionError)) throw e
      console.error(e)
      throw new GeneralError(e.message)
    }
  }
}
