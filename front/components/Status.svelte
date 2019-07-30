<div class="container page">
  <div class="row">
    <div class="col-sm-6">
      <h3>Status</h3>
    </div>
    <div class="col-sm-6 text-right">
      {#if $mining}
        <div class="btn btn-success" on:click={ stopMine }>Mining</div>
      {:else}
        <div class="btn btn-danger" on:click={ startMine }>Not Mining</div>
      {/if}
    </div>
  </div>
  <hr>

  <h5>Lastest blocks</h5>
  <div class="table-responsive mb-5">
    <table class="table table-striped table-light">
      <tbody>
      <tr>
        <th>Height</th>
        <th>Age</th>
        <th>Transactions</th>
        <th>Total Sent</th>
        <th>Size</th>
      </tr>
      {#each chainReversed as block}
        <tr>
          <td><a href="{ 'block/' + block.index }" use:link>{ block.index }</a></td>
          <td>{ moment(block.time * 1000).from($time * 1000) }</td>
          <td>{ block.transactions.length }</td>
          <td>{ totalOutput(block) }</td>
          <td>{ Number(JSON.stringify(block).length / 1024).toFixed(2) } kB</td>
        </tr>
      {/each}
      </tbody>
    </table>
  </div>

  <div class="row">
    <div class="col-sm-6">

      <div class="card mb-5">
        <div class="card-header"><strong>Mempool</strong></div>
        <div class="list-group list-group-flush">
          {#if mempool.length}
            {#each chain as block}
              <div class="list-group-item">
                <a href="{ 'transaction/' + tx.id }" use:link>{ getTransactionMessage(tx) }</a>
              </div>
            {/each}
          {:else}
            <div class="list-group-item">Mempool is empty</div>
          {/if}
        </div>
      </div>

    </div>
    <div class="col-sm-6">

      <div class="card mb-5">
        <div class="card-header"><strong>Wallets</strong></div>
        <div class="list-group list-group-flush">
          {#each $wallets as wallet}
            <div class="list-group-item">
              <a href="{ 'address/' + wallet.public }" use:link>{ wallet.name }: { wallet.public }</a>
              <div>Balance: { wallet.balance } MLB</div>
            </div>
          {/each}
        </div>
        <div class="card-footer">
          <button type="button" class="btn pull-right btn-warning btn-sm" on:click={() => showSendForm = true }>Send MLB</button>
        </div>
      </div>

    </div>

    <SendForm show={showSendForm} />

  </div>

</div>

<script>
import moment from 'moment-mini'
import {link} from 'svelte-routing'
import {wallets, chain, mempool, block, mining, time} from '../store'
import {startMine, stopMine} from '../actions'
import SendForm from './partials/SendForm.svelte'

let showSendForm = false

let chainReversed
chain.subscribe(c => chainReversed = c.slice().reverse())

const getTransactionMessage = (transaction) => {
  const from = transaction.inputs[0]
  let to = transaction.outputs.find(o => o.address !== from.address)
  if (! to) to = from
  const time = moment(transaction.time * 1000).format('YYYY-MM-DD h:mm:ss a')

  return `[${time}] Amount: ${to.amount}<br> from: ${from.address.substring(0, 20) + '...'} -> to: ${to.address.substring(0, 20) + '...'}`
}

const totalOutput = (block) => {
  return block.transactions.reduce((acc, tx) => acc + tx.outputs.reduce((acc, out) => acc + out.amount, 0), 0)
}
</script>
