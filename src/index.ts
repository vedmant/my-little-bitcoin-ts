import dotenv from 'dotenv'
import Sentry from '@sentry/node'
import config from './config'
import Bus from './bus'
import Store from './store'
import Miner from './miner'
import Server from './server'
import Peers from './peers'

dotenv.config()

const bus = new Bus
const store = new Store(config, bus)
const miner = new Miner(config, bus, store)
const server = new Server(config, bus, store, miner)
server.start()

if (process.env.APP_ENV === 'production') {
  Sentry.init({dsn: process.env.SENTRY_DSN})
}

if (config.demoMode) {
  miner.mine(store.wallets[0])
} else {
  // Connect to peers and recieve connections
  const peers = new Peers(config, bus, store)
  peers.start()
}
