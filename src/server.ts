import path from 'path'
import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import expressWinston from 'express-winston'
import winston from 'winston'
import { generateKeyPair, Wallet } from './lib/wallet'
import { GeneralError, TransactionError } from './errors'
import Debug from 'debug'
import http from 'http'
import SocketIo from 'socket.io'
import Bus from './bus'
import Miner from './miner'
import Store from './store'
import { Block } from './lib/block'
import { Input, Output, Transaction } from './lib/transaction'

const debug = Debug('app:server')

export default class Server {

  config: any
  bus: Bus
  store: Store
  miner: Miner
  app: express.Application
  http: http.Server
  io: SocketIo.Server

  constructor(config: any, bus: Bus, store: Store, miner: Miner) {
    this.config = config
    this.bus = bus
    this.store = store
    this.miner = miner
  }

  broadcast (type: string, data?: any) {
    debug(`Broadcast WS message: ${type}`)
    this.io.emit(type, data)
  }

  start () {
    this.app = express()
    this.http = http.createServer(this.app)
    this.io = SocketIo(this.http)

    // Establish socket.io connection
    this.io.on('connection', function (socket) {
      debug('Websocket user connected')
      socket.on('disconnect', function () {
        debug('Websocket user disconnected')
      })
    })

    // Broadacast messages
    this.bus.on('block-added', (block: Block) => this.broadcast('block-added', block))
    this.bus.on('block-added-by-me', (block: Block) => this.broadcast('block-added-by-me', block))
    this.bus.on('transaction-added-by-me', transaction => this.broadcast('transaction-added', transaction))
    this.bus.on('transaction-added', transaction => this.broadcast('transaction-added', transaction))
    this.bus.on('balance-updated', balance => this.broadcast('balance-updated', balance))
    this.bus.on('mine-start', () => this.broadcast('mine-started'))
    this.bus.on('mine-stop', () => this.broadcast('mine-stopped'))
    this.bus.on('recieved-funds', (data) => this.broadcast('recieved-funds', data))

    // Parse bodies
    this.app.use(bodyParser.json()) // support json encoded bodies
    this.app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

    // Add winston logger
    this.app.use(expressWinston.logger({transports: [new winston.transports.File({
      filename: 'logs/express.log', maxsize: 1024 * 1024, maxFiles: 100, tailable: true,
    })]}))

    // Serve static files
    this.app.use('/', express.static(path.resolve(__dirname, '../public')))

    /*
     * Get short blockchain status
     */
    this.app.get('/v1/status', (req: Request, res: Response) => res.json({
      time: Math.floor(new Date().getTime() / 1000),
      chain: this.store.chain.slice(Math.max(this.store.chain.length - 5, 0)),
      mempool: this.store.mempool.slice(Math.max(this.store.mempool.length - 5, 0)),
      wallets: this.store.wallets.map(w => ({name: w.name, public: w.public, balance: this.store.getBalanceForAddress(w.public)})),
      mining: this.store.mining,
      demoMode: !! this.config.demoMode,
    }))

    /*
     * Send money to address
     */
    this.app.get('/v1/send/:from/:to/:amount', (req: Request, res: Response) => {
      try {
        res.json(this.store.send(req.params.from, req.params.to, parseInt(req.params.amount)))
      } catch (e) {
        if (! (e instanceof GeneralError) && ! (e instanceof TransactionError)) throw e
        res.status(403).send(e.message)
      }
    })

    /*
     * Get block by index
     */
    this.app.get('/v1/block/:index', (req: Request, res: Response) => res.json({
      block: this.store.chain.find(b => b.index === parseInt(req.params.index))
    }))

    /*
     * Get address
     */
    this.app.get('/v1/address/:address', (req: Request, res: Response) => {
      const transactions = this.store.getTransactionsForAddress(req.params.address)
      res.json({
        balance: this.store.getBalanceForAddress(req.params.address),
        transactions: transactions.slice(-100).reverse(), // Last 100 transactions
        totalTransactions: transactions.length,
        totalRecieved: transactions.reduce((acc: number, tx: Transaction) =>
          acc + tx.outputs.reduce((acc: number, o: Output) => acc + (o.address === req.params.address ? o.amount : 0), 0), 0),
      })
    })

    /*
     * Get transaction by txid
     */
    this.app.get('/v1/transaction/:id', (req: Request, res: Response) => {
      const transaction = this.store.getTransactions().find((tx: Transaction) => tx.id === req.params.id)
      if (! transaction) return res.status(404).send('Cant find transaction')
      const block = this.store.chain.find((block: Block) => block.transactions.find(tx => tx.id === req.params.id))
      res.json({transaction, block})
    })

    /*
     * My Wallets
     */
    this.app.get('/v1/wallets', (req: Request, res: Response) => res.json(this.store.wallets.map((wallet: Wallet) => {
      const transactions = this.store.getTransactionsForAddress(wallet.public).reverse()
      return {
        name: wallet.name,
        public: wallet.public,
        balance: this.store.getBalanceForAddress(wallet.public),
        totalTransactions: transactions.length,
        transactions: transactions.slice(Math.max(transactions.length - 100, 0)),
        totalRecieved: transactions.reduce((acc: number, tx: Transaction) => acc + tx.outputs.reduce((acc: number, o: Output) =>
          acc + (o.address === wallet.public ? o.amount : 0), 0), 0),
        totalSent: transactions.reduce((acc: number, tx: Transaction) =>
          acc + tx.inputs.reduce((acc: number, i: Input) => acc + (i.address === wallet.public ? i.amount : 0), 0), 0),
      }
    })))

    /*
     * Create new wallet
     */
    this.app.post('/v1/wallet/create', (req: Request, res: Response) => {
      const wallet = {name: req.body.name, ...generateKeyPair()}
      this.store.addWallet(wallet)
      res.json({name: wallet.name, public: wallet.public, balance: this.store.getBalanceForAddress(wallet.public)})
    })

    /*
     * Start mining
     */
    this.app.get('/v1/mine-start', (req: Request, res: Response) => {
      this.store.mining = true
      this.bus.emit('mine-start')
      if (! this.config.demoMode) this.miner.mine(this.store.wallets[0])
      res.json('Ok')
    })

    /*
     * Stop mining
     */
    this.app.get('/v1/mine-stop', (req: Request, res: Response) => {
      if (this.config.demoMode) return res.status(403).send('Can not stop miner in Demo mode')
      this.store.mining = false
      this.bus.emit('mine-stop')
      res.json('Ok')
    })

    this.http.listen(this.config.httpPort, this.config.httpHost, () => debug('Listening http on host: ' + this.config.httpHost + '; port: ' + this.config.httpPort))
  }
}
