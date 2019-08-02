<div class="container page">
  <h3>My Wallets</h3>
  <hr>

  <button class="btn btn-success mb-3" on:click={ () => showCreateNew = true }>Create new</button>

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
          <td><button class="btn btn-primary pull-right btn-xs" on:click={ () => onSendClick(wallet) }>Send</button></td>
        </tr>
      {/each}
      </tbody>
    </table>
  </div>

  <div class="modal fade" tabindex="-1" role="dialog" id="create_modal">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Create new wallet</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Name</label>
            <input type="text" class={'form-control' + (error ? ' is-invalid' : '') } required placeholder="Wallet name" bind:value={ name }>
            {#if error}
              <div class="invalid-feedback">{ error }</div>
            {/if}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" on:click={ create }>Send</button>
        </div>
      </div>
    </div>
  </div>

  <SendForm show={ showSendForm } wallets={ $wallets } fromDefault={ from } on:hide={ () => showSendForm = false }/>
</div>

<script>
import jquery from 'jquery'
import { link } from 'svelte-spa-router'
import { onMount } from 'svelte'
import { wallets, chain } from '../store'
import { getStatus, getWallets, createWallet } from '../actions'
import SendForm from './partials/SendForm.svelte'

let name = ''
let error = ''
let from = ''
let selectedWallet = {}
let showCreateNew = false
let showSendForm = false

onMount(async () => {
  if (! $chain.length) await getStatus()
  await getWallets()
})

$: if (showCreateNew) jquery('#create_modal').modal('show').on('hidden.bs.modal', function () {
  showCreateNew = false
})

const onSendClick = (w) => {
  selectedWallet = w
  from = w.public
  showSendForm = true
}

const create = async () => {
  if (! name) {
    return error = 'Please type wallet name'
  }

  await createWallet(name)
  await getWallets()
  name = ''
  error = ''
  jquery('#create_modal').modal('hide')
}

</script>
