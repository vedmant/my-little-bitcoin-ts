import Bus from './bus';
import WebSocket from 'ws'
import { BlockError, TransactionError } from './errors'
import Store from './store'
import { Block } from './lib/block'
import { Transaction } from './lib/transaction'
import * as http from 'http'
import Debug from 'debug'

const debug = Debug('app:peers')

interface Peer {
  url: string
  ws: WebSocket
  timeoutId: any
  retries: number
  initial: boolean
}

interface Message {
  type: string
  message?: any
  blocks?: Block[]
  block?: Block
  index?: number
  transaction?: Transaction
  [key: string]: any
}


export default class Peers {

  config: any
  bus: Bus
  store: Store
  peers: Peer[]
  server: WebSocket.Server

  constructor (config: any, bus: Bus, store: Store) {
    this.config = config
    this.bus = bus
    this.store = store
    this.peers = store.peers.map(peer => ({url: peer, ws: undefined, timeoutId: undefined, retries: 0, initial: true}))
  }

  /**
   * Start websocket p2p server
   */
  start () {
    // Broadacast messages to all peers
    this.bus.on('block-added-by-me', block => this.broadcast({type: 'new-block', block}))
    this.bus.on('transaction-added-by-me', transaction => this.broadcast({type: 'new-transaction', transaction}))

    this.peers.forEach((connection, index) => this.connectToPeer(connection, index))

    this.server = new WebSocket.Server({port: this.config.p2pPort})
    this.server.on('connection', (ws: WebSocket, req: http.IncomingMessage) => this.initConnection(ws, req))

    debug('listening websocket p2p port on: ' + this.config.p2pPort)
  }

  /**
   * Send message to peer
   */
  write (peer: Peer, message: Message) {
    debug(`Send message: ${message.type} to: ${peer.url}`)
    peer.ws.send(JSON.stringify(message))
  }

  /**
   * @param message
   */
  broadcast (message: Message) {
    debug(`Broadcast message: ${message.type}`)
    this.peers.filter(c => c.ws).forEach(c => this.write(c, message))
  }

  /**
   * Handle incoming messages
   */
  initMessageHandler (peer: Peer) {
    const ws = peer.ws

    ws.on('message', (data: WebSocket.Data) => {
      let message: Message
      try {
        message = JSON.parse(data.toString())
      } catch (e) {
        console.error('Failed to json parse recieved data from peer')
      }

      debug(`Received message: ${message.type}`)

      // TODO: validate requests
      switch (message.type) {
        case 'get-blocks-after':
          this.write(peer, {type: 'blocks-after', blocks: this.store.blocksAfter(message.index + 1)})
          break

        case 'blocks-after':
          message.blocks.forEach(block => {
            try {
              this.store.addBlock(block)
            } catch (e) {
              if (! (e instanceof BlockError) && ! (e instanceof TransactionError)) throw e
            }
          })
          break

        case 'new-block':
          try {
            // Load all blocks needed if recieved block is not next for our chain
            if (message.block.index - this.store.lastBlock().index > 1) {
              return this.write(peer, {type: 'get-blocks-after', index: this.store.lastBlock().index})
            }
            const block = this.store.addBlock(message.block)
            this.bus.emit('block-added', block)
          } catch (e) {
            if (! (e instanceof BlockError) && ! (e instanceof TransactionError)) throw e
            this.write(peer, {type: 'error', message: e.message})
          }
          break

        case 'new-transaction':
          try {
            this.store.addTransaction(message.transaction, true)
          } catch (e) {
            this.write(peer, {type: 'error', message: e.message})
          }
          break
      }
    })
  }

  /**
   * Handle connection errors
   */
  initErrorHandler (peer: Peer, index: number) {
    const closeConnection = (peer: Peer, index: number) => {
      debug(`Connection broken to: ${peer.url === undefined ? 'incoming' : peer.url}`)
      peer.ws = undefined

      // Retry initial peers 3 times
      if (peer.initial && peer.retries < 4) {
        peer.retries++
        debug(`Retry in 3 secs, retries: ${peer.retries}`)
        peer.timeoutId = setTimeout(() => this.connectToPeer(peer, index), 3000)
      }
    }
    peer.ws.on('close', () => closeConnection(peer, index))
    peer.ws.on('error', () => closeConnection(peer, index))
  }

  /**
   * Handle connection initialization
   */
  initConnection (ws: WebSocket, req: http.IncomingMessage = undefined, index: number = undefined) {
    let peer: Peer
    let url = ws.url

    if (index === null) {
      // If peer connected to us
      url = req.connection.remoteAddress
      peer = {url, ws, timeoutId: undefined, retries: 0, initial: false}
      this.peers.push(peer)
      debug(`Peer ${url} connected to us`)
    } else {
      // We connected to peer
      peer = this.peers[index]
      debug(`Connected to peer ${url}`)
    }
    peer.retries = 0

    clearTimeout(peer.timeoutId)
    this.initMessageHandler(peer)
    this.initErrorHandler(peer, index)

    // Get full blockchain from first peer
    if (index === 0) {
      this.write(peer, {type: 'get-blocks-after', index: this.store.lastBlock().index})
    }
  }

  /**
   * Connect to peer
   */
  connectToPeer (peer: Peer, index: number = undefined) {
    peer.ws = new WebSocket(peer.url)
    peer.ws.on('open', () => this.initConnection(peer.ws, undefined, index))
    peer.ws.on('error', () => {
      debug(`Connection failed to ${peer.url}`)

      // Retry initial connection 3 times
      if (peer.initial && peer.retries < 4) {
        debug(`Retry in 3 secs, retries: ${peer.retries}`)
        peer.retries++
        peer.timeoutId = setTimeout(() => {
          this.connectToPeer(peer, index)
        }, 3000)
      }
    })
  }
}
