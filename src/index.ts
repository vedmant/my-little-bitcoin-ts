require('dotenv').config()
import Sentry from '@sentry/node'
// global.debug = require('debug')('app:global')
import config from './config'
import bus from './bus'
import storeFactory from './store'

const store = storeFactory(config, bus)
const miner = require('./miner')(config, bus, store)
require('./server')(config, bus, store, miner).start()

if (process.env.APP_ENV === 'production') {
  Sentry.init({dsn: process.env.SENTRY_DSN})
}

if (config.demoMode) {
  miner.mine(store.wallets[0])
} else {
  require('./peers')(config, bus, store).start() // Connect to peers and recieve connections
}
