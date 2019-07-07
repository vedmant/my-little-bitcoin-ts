//All globals styles should be imported there. I.e. any CSS frameworks or something like this.
import './scss/index.scss'
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app'),
  // hydrate: true,
  data: {
    name: 'MyLittleBitcoin'
  }
})

export default app
