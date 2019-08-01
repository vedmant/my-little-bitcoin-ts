<div class="container page">
  <h3>My Wallets</h3>
  <hr>

  <button class="btn btn-success mb-3" on:click={() => showCreateNew = true}>Create new</button>

  <div class="table-responsive mb-5">
    <table class="table table-striped table-light">
      <tbody>
      <tr>
        <th>Name</th>
        <th>Address</th>
        <th>Balance</th>
        <th>Total Received</th>
        <th>Total Sent</th>
        <th>Actions</th>
      </tr>
      {#each $wallets as wallet}
        <tr>
          <td>{ wallet.name }</td>
          <td><a href={'/address/' + wallet.public} use:link>{ wallet.public }</a></td>
          <td>{ wallet.balance }</td>
          <td>{ wallet.totalRecieved }</td>
          <td>{ wallet.totalSent }</td>
          <td><button class="btn btn-primary pull-right btn-xs" on:click={onSendClick(wallet)}>Send</button></td>
        </tr>
      {/each}
      </tbody>
    </table>
  </div>

  <!-- <b-modal v-model="showCreateNew" title="Create new wallet" ok-title="Create" @ok="onCreateSubmit">
    <b-form>
      <b-form-group label="Name">
        <b-form-input type="text" v-model="newForm.name" required placeholder="Name"></b-form-input>
      </b-form-group>
      <input type="submit" style="position: absolute; left: -9999px"/>
    </b-form>
  </!--> -->

  <SendForm show={ showSendForm } wallets={ $wallets } on:hide={ hideSendForm }/>
</div>

<script>
import {link} from 'svelte-spa-router'
import {wallets, chain, mempool, block, mining, time} from '../store'
import SendForm from './partials/SendForm.svelte'

let from = ''

let selectedWallet = {}

let showCreateNew = false
const hideCreateNew = () => showCreateNew = false

let showSendForm = false
const hideSendForm = () => showSendForm = false

const onSendClick = (w) => {
  selectedWallet = w
  from = w.public
  showSendForm = true
}
</script>
