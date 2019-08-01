<div class="container page">
  <h3>Transaction: { params.id }</h3>
  <hr>

  {#if $transaction.transaction.id}
    <Transactions transactions={[$transaction.transaction]} />

    <div class="row mt-5">
      <div class="col-sm-6">
        <h5>Summary</h5>
        <div class="table-responsive">
          <table class="table table-striped table-light">
            <tbody>
            <tr>
              <td>Block</td>
              <td>
                {#if $transaction.block}
                  <a href={'/block/' + $transaction.block.index} use:link>{ $transaction.block.index }</a>
                {:else}
                  <strong v-else="">Unconfirmed</strong>
                {/if}
              </td>
            </tr>
            <tr>
              <td>Confirmations</td>
              <td>
                {#if $transaction.block}
                  <strong v-if="transaction.block">{ ($lastBlock ? $lastBlock.index : 0) - $transaction.block.index + 1 }</strong>
                {:else}
                  <strong v-else="">Unconfirmed</strong>
                {/if}
              </td>
            </tr>
            <tr>
              <td>Size</td>
              <td>{JSON.stringify($transaction.transaction).length } (bytes)</td>
            </tr>
            <tr>
              <td>Recieved Time</td>
              <td>{ moment($transaction.transaction.time * 1000).format('YYYY-MM-DD h:mm:ss a') }</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {/if}
</div>

<script>
import moment from 'moment-mini'
import { link } from 'svelte-spa-router'
import Transactions from './partials/Transactions.svelte'
import { transaction, lastBlock } from '../store'
import { getTransaction } from '../actions'

export let params = {}

$: getTransaction(params.id)

</script>