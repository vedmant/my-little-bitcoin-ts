<div class="table-responsive">
  {#if transactions.length}
    <table class="table table-striped table-light">
      {#each transactions as tx}
        <tbody>
        <tr>
          <td><a href={'/transaction/' + tx.id} use:link>{ tx.id }</a></td>
          <td></td>
          <td class="text-right">{ moment(tx.time * 1000).format('YYYY-MM-DD h:mm:ss a') }</td>
        </tr>
        <tr>
          <td>
            {#each tx.inputs as input}
              <div>
                <a href={'/address/' + input.address} use:link>{ input.address }</a>
                - ({ input.amount } MLB - <a href={'/transaction/' + input.tx} use:link>Output</a>)
              </div>
            {/each}
            {#if ! tx.inputs.length}
              <strong>No Inputs (Newly Generated Coins)</strong>
            {/if}
          </td>
          <td class="vertical-middle">
            {@html icon('arrow-right') }
          </td>
          <td>
            {#each tx.outputs as output}
              <div>
                <div class="pull-right">{ output.amount } MLB</div>
                <a href={'/address/' + output.address} use:link>{ output.address }</a>
              </div>
            {/each}
          </td>
        </tr>
        </tbody>
      {/each}
    </table>
  {:else}
    <p>No transactions</p>
  {/if}
</div>

<script>
import octicons from 'octicons'
import moment from 'moment-mini'
import {link} from 'svelte-spa-router'

export let transactions = []

const icon = (name) => {
  return octicons[name].toSVG({width: 30})
}

</script>