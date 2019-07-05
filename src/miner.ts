import Bus from './bus'
import Store from './store'
import { Block, calculateHash, createBlock } from './lib/block'
import co from 'co'
import { BlockError, TransactionError } from './errors'
import Debug from 'debug'
import { Wallet } from './lib/wallet'
import { Transaction } from './lib/transaction'
import { job, start, stop } from 'microjob'

const debug = Debug('app:miner')

export default class Miner {

  config: any
  bus: Bus
  store: Store

  constructor (config: any, bus: Bus, store: Store) {
    this.config = config
    this.bus = bus
    this.store = store
  }

  /**
   * Start mining
   */
  async mine (wallet: Wallet) {
    if (! this.store.mining) return

    while (this.store.mining) {
      try {
        const block = await this.mineBlock(this.store.getTransactionsForNextBlock(), this.store.lastBlock(), this.store.difficulty, wallet)
        if (! block) {
          // Someone mined block first or new transaction was added, start mining new one
          continue
        }
        this.store.addBlock(block)
        this.bus.emit('block-added-by-me', block)
        this.bus.emit('balance-updated', { public: wallet.public, balance: this.store.getBalanceForAddress(wallet.public) })
      } catch (e) {
        if (! (e instanceof BlockError) && ! (e instanceof TransactionError)) throw e
        console.error(e)
      }
    }
  }

  /**
   * Mine a block in separate process
   */
  mineBlock (transactions: Transaction[], lastBlock: Block, difficulty: number, wallet: Wallet): Promise<Block> {
    const block = createBlock(transactions, lastBlock, wallet)
    block.hash = calculateHash(block)

    debug(`Started mining block ${block.index}`)

    return new Promise((resolve, reject) => {
      if (this.config.demoMode) {
        setTimeout(() => this.findBlockHash(block, difficulty).then(block => resolve(block)), 60 * 1000)
      } else {
        this.findBlockHash(block, difficulty).then(block => resolve(block))
      }
    })
  }

  /**
   * Find block hash according to difficulty
   */
  async findBlockHash (block: Block, difficulty: number): Promise<Block> {
    let working = false

    const mineStop = () => {
      if (! working) return
      removeListeners()
      debug('kill thread')
      stop()
      working = false
    }
    // Listeners for stopping mining
    const blockAddedListener = (b: Block) => {if (b.index >= block.index) mineStop()}
    const mineStopListener = (b: Block) => mineStop()

    const removeListeners = () => {
      this.bus.removeListener('block-added', blockAddedListener)
      this.bus.removeListener('mine-stop', mineStopListener)
      this.bus.removeListener('transaction-added', mineStopListener)
      this.bus.removeListener('transaction-added-by-me', mineStopListener)
    }
    // If other process found the same block faster, kill current one
    this.bus.once('block-added', blockAddedListener)
    this.bus.once('mine-stop', mineStopListener)
    this.bus.once('transaction-added', mineStopListener)
    this.bus.once('transaction-added-by-me', mineStopListener)

    try {
      // start the worker pool
      await start({maxWorkers: 1})
      working = true

      // this function will be executed in another thread
      return await job((data) => {
        const debug = require('debug')('app:miner')
        const CryptoJS = require('crypto-js')

        // Due to some limitation with ts-node and requiring typescript file
        // I just copied calculateHash and getDifficulty methods from the
        // block lib to this closure
        const calculateHash = (block: Block) => {
          const {index, prevHash, time, transactions, nonce} = block
          return CryptoJS.SHA256(JSON.stringify({index, prevHash, time, transactions, nonce})).toString()
        }
        const getDifficulty = (hash: string): number => parseInt(hash.substring(0, 8), 16)

        const {block, difficulty} = data
        while (getDifficulty(block.hash) >= difficulty) {
          block.nonce++
          block.hash = calculateHash(block)

          if (block.nonce % 100000 === 0) debug('100K hashes')
        }

        return block
      }, {data: {block, difficulty}})
    } catch (err) {
      console.error(err)
      working = false
    } finally {
      // shutdown worker pool
      await stop()
      working = false
    }
  }
}
