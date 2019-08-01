import axios from 'axios'
import * as store from './store'

axios.defaults.baseURL = 'http://localhost:3001/' // TODO put to config
axios.interceptors.response.use((response) => response, (error) => {
  store.addToast({ type: 'error', text: error.response.data })
  return Promise.reject(error)
})

export const getStatus = async () => {
  store.loading.set(true)
  const { data } = await axios.get('/v1/status')

  store.loading.set(false)
  store.time.set(data.time)
  store.chain.set(data.chain)
  store.mempool.set(data.mempool)
  store.wallets.set(data.wallets)
  store.mining.set(data.mining)
  store.demoMode.set(data.demoMode)
}

export const stopMine = async () => {
  await axios.get('/v1/mine-stop')
}

export const startMine = async () => {
  await axios.get('/v1/mine-start')
}

export const getBlock = async (index) => {
  store.loading.set(true)
  const resp = await axios.get('/v1/block/' + index)
  store.loading.set(false)
  store.block.set(resp.data.block)
}

export const getAddress = async (address) => {
  store.loading.set(true)
  const resp = await axios.get('/v1/address/' + address)
  store.loading.set(false)
  store.address.set(resp.data)
}

export const getTransaction = async (id) => {
  store.loading.set(true)
  const resp = await axios.get('/v1/transaction/' + id)
  store.loading.set(false)
  store.transaction.set(resp.data)
}

export const getWallets = async () => {
  store.loading.set(true)
  const resp = await axios.get('/v1/wallets')
  store.loading.set(false)
  store.wallets.set(resp.data)
}

export const createWallet = async (name) => {
  store.loading.set(true)
  const resp = await axios.post('/v1/wallet/create', { name })
  store.loading.set(false)
  store.wallets.update(w => {
    w.push(resp.data)
    return w
  })
}

export const sendFunds = async ({ from, to, amount }) => {
  await axios.get(`/v1/send/${from}/${to}/${amount}`)
}
