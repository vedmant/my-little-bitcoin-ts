import { BlockError } from '../errors'
import CryptoJS from 'crypto-js'
import Joi from 'joi'
import { checkTransactions, createRewardTransaction, Output, Transaction } from './transaction'
import { Wallet } from './wallet'

export interface Block {
  index: number
  prevHash: string
  time: number
  transactions: Transaction[]
  nonce: number
  hash: string
}

const blockSchema = Joi.object().keys({
  index: Joi.number(), // Transaction index or height
  prevHash: Joi.string().hex().length(64), // Hash of the previous block
  time: Joi.number(), // Current block timestamp
  transactions: Joi.array(), // List of transactions, included into the block
  nonce: Joi.number(), // Nonce, required for proof of work protocol
  hash: Joi.string().hex().length(64), // Current block hash
})

/**
 * Validate block data
 *
 * @param block
 * @return {*}
 */
export function isDataValid (block: Block): boolean {
  return Joi.validate(block, blockSchema).error === null
}

/**
 * Verify block
 *
 * @param previousBlock
 * @param block
 * @param difficulty
 * @param unspent
 */
export function checkBlock (previousBlock: Block, block: Block, difficulty: number, unspent: Output[]) {
  if (! isDataValid(block)) throw new BlockError('Invalid block data')
  const blockDifficulty = getDifficulty(block.hash)
  if (previousBlock.index + 1 !== block.index) throw new BlockError('Invalid block index')
  if (previousBlock.hash !== block.prevHash) throw new BlockError('Invalid block prevhash')
  if (calculateHash(block) !== block.hash) throw new BlockError('Invalid block hash')
  if (blockDifficulty > difficulty) throw new BlockError('Invalid block difficulty')
  checkTransactions(block.transactions, unspent)
}

/**
 * Generate block hash
 *
 * @param block
 */
export function calculateHash (block: Block) {
  const {index, prevHash, time, transactions, nonce} = block

  return CryptoJS.SHA256(JSON.stringify({index, prevHash, time, transactions, nonce})).toString()
}

/**
 * Create genesis block
 *
 * @return {{index: number, prevHash: string, time: number, transactions: Array, nonce: number}}
 */
export function makeGenesisBlock (): Block {
  const block: Block = {
    index: 0,
    prevHash: '0',
    time: 1505759228,
    transactions: [],
    nonce: 0,
    hash: '',
  }
  block.hash = calculateHash(block)

  return block
}

/**
 * Create new block
 *
 * @param transactions {array}
 * @param lastBlock {object}
 * @param wallet {{private: string, public: string}}
 * @return {{index: number, prevHash, time: number, transactions: Array, nonce: number}}
 */
export function createBlock (transactions: Transaction[], lastBlock: Block, wallet: Wallet) {
  transactions = transactions.slice()
  transactions.push(createRewardTransaction(wallet))
  const block = {
    index: lastBlock.index + 1,
    prevHash: lastBlock.hash,
    time: Math.floor(new Date().getTime() / 1000),
    transactions,
    nonce: 0,
    hash: '',
  }
  block.hash = calculateHash(block)

  return block
}

/**
 * Get hash difficulty
 *
 * @param hash
 * @return {Number}
 */
export function getDifficulty (hash: string): number {
  return parseInt(hash.substring(0, 8), 16)
}
