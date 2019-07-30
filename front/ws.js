import io from 'socket.io-client'
import * as store from './store'

const socket = io('http://localhost:3001')

socket.on('block-added', (block) => {
  store.addBlock(block)
})

socket.on('block-added-by-me', (block) => {
  // store.dispatch('addToastMessage', { text: `You mined a new block, index: ${block.index}`, type: 'success' })
  store.addBlock(block)
})

socket.on('transaction-added', (transaction) => store.commit('ADD_TRANSACTION', transaction))
socket.on('balance-updated', (balance) => store.updateBalance(balance))
socket.on('mine-started', () => store.mining.set(true))
socket.on('mine-stopped', () => store.mining.set(false))
socket.on('recieved-funds', (data) => {
  store.commit('RECIEVED_FUNDS', data)
  store.dispatch('addToastMessage', { text: `You just recieved ${data.amount} MLB on wallet: ${data.name}!`, type: 'success' })
})
