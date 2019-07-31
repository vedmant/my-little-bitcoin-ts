{#if $block}
  <div class="container page">
    <h3>Block #{ $block.index }</h3>
    <hr>

    <div class="row">
      <div class="col-sm-6">
        <h5>Summary</h5>
        <div class="table-responsive">
          <table class="table table-striped table-light">
            <tbody>
            <tr>
              <td>Number Of Transactions</td>
              <td>{ $block.transactions ? $block.transactions.length : '' }</td>
            </tr>
            <tr>
              <td>Output Total</td>
              <td>{ $blockOutput }</td>
            </tr>
            <tr>
              <td>Height</td>
              <td>{ $block.index }</td>
            </tr>
            <tr>
              <td>Timestamp</td>
              <td>{ moment($block.time * 1000).format('YYYY-MM-DD h:mm:ss a') }</td>
            </tr>
            <tr>
              <td>Block Reward</td>
              <td>{ $blockReward }</td>
            </tr>
            <tr>
              <td>Nonce</td>
              <td>{ $block.nonce }</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="col-sm-6">
        <h5>Hashes</h5>
        <div class="table-responsive">
          <table class="table table-striped table-light">
            <tbody>
            <tr>
              <td>Hash</td>
              <td class="smaller"><a href={'/block/' + $block.index} use:link>{ $block.hash }</a></td>
            </tr>
            <tr>
              <td>Previous Block</td>
              <td class="smaller"><a href={'/block/' + ($block.index - 1)} use:link>{ $block.prevHash }</a></td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <h4 class="mt-5">Transactions</h4>
    <Transactions transactions={ $block.transactions ? $block.transactions.slice().reverse() : []} />

  </div>
{/if}

<script>
import moment from 'moment-mini'
import {link} from 'svelte-spa-router'
import { onMount } from 'svelte'
import Transactions from './partials/Transactions.svelte'
import {block, blockOutput, blockReward} from '../store'
import {getBlock} from '../actions'

export let params = {}

onMount(() => {
  getBlock(params.id)
})
</script>
