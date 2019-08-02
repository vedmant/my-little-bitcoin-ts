<Spinner/>
<Toast/>
<Navbar/>

<div class="container">
  <Router {routes}/>
</div>

<script>
import Router from 'svelte-spa-router'
import Navbar from './components/Navbar.svelte'
import Spinner from './components/Spinner.svelte'
import Toast from './components/Toast.svelte'
import Wallets from './components/Wallets.svelte'
import Status from './components/Status.svelte'
import Block from './components/Block.svelte'
import Address from './components/Address.svelte'
import Transaction from './components/Transaction.svelte'
import NotFound from './components/404.svelte'

const routes = {
  '/': Status,
  '/wallets': Wallets,
  '/block/:id': Block,
  '/address/:id': Address,
  '/transaction/:id': Transaction,
  '*': NotFound,
}
</script>
