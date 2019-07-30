import axios from 'axios'
import * as store from './store'

axios.defaults.baseURL = 'http://localhost:3001/'
axios.interceptors.response.use(function (response) {
  // Do something with response data
  return response
}, function (error) {
  // store.dispatch('addToastMessage', {type: 'danger', text: error.response.data})
  // store.commit('ERROR', error)
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
