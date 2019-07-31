import io from 'socket.io-client'
import * as store from './store'

const socket = io('http://localhost:3001') // TODO add config

socket.on('block-added', (block) => {
  store.addBlock(block)
})

socket.on('block-added-by-me', (block) => {
  store.addToast({ text: `You mined a new block, index: ${block.index}` })
  store.addBlock(block)
})

socket.on('transaction-added', (transaction) => store.addTransaction(transaction))
socket.on('balance-updated', (balance) => store.updateBalance(balance))
socket.on('mine-started', () => {
  store.mining.set(true)
  store.addToast({ text: 'Started mining' })
})
socket.on('mine-stopped', () => {
  store.mining.set(false)
  store.addToast({ text: 'Stopped mining' })
})
socket.on('recieved-funds', (data) => {
  store.recievedFunds(data)
  store.addToast({ text: `You just recieved ${data.amount} MLB on wallet: ${data.name}!` })
})
