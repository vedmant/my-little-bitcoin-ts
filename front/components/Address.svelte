{#if $address}
  <div class="container page">
    <h3>Address: { params.id }</h3>
    <hr>

    <div class="row">
      <div class="col-sm-6">
        <h5>Summary</h5>
        <div class="table-responsive">
          <table class="table table-striped table-light">
            <tbody>
            <tr>
              <td>Address</td>
              <td>{ params.id }</td>
            </tr>
            <tr>
              <td>Public Key</td>
              <td class="smaller">{ $publicKey }</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="col-sm-6">
        <h5>Transactions</h5>
        <div class="table-responsive">
          <table class="table table-striped table-light">
            <tbody>
            <tr>
              <td>No. Transactions</td>
              <td>{ $address.totalTransactions }</td>
            </tr>
            <tr>
              <td>Total Received</td>
              <td>{ $address.totalRecieved }</td>
            </tr>
            <tr>
              <td>Final Balance</td>
              <td>{ $address.balance }</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <h4 class="mt-5">Transactions</h4>
    <Transactions transactions={ $address.transactions }/>

  </div>
{/if}

<script>
import moment from 'moment-mini'
import bs58 from 'bs58'
import { derived } from 'svelte/store'
import { onMount } from 'svelte'
import Transactions from './partials/Transactions.svelte'
import {address} from '../store'
import {getAddress} from '../actions'

export let params = {}

onMount(() => {
  getAddress(params.id)
})

const publicKey = derived(address, $address => {
  return bs58.decode(params.id).toString('hex')
})

</script>
