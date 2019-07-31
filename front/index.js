//All globals styles should be imported there. I.e. any CSS frameworks or something like this.
import './scss/index.scss'
import App from './App.svelte'
import './ws'
import 'jquery'
import 'bootstrap'

const app = new App({
  target: document.getElementById('app'),
  // hydrate: true,
  data: {
    name: 'MyLittleBitcoin'
  }
})

export default app
