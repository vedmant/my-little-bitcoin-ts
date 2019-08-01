<div class="modal fade" tabindex="-1" role="dialog" id="send_modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Send MLB to</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>From</label>
          <select class="form-control" bind:value={ from } required>
            {#each wallets as wallet}
              <option value="{ wallet.public }">{ wallet.name }</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label>To</label>
          {#if $demoMode}
            <select class="form-control" bind:value={ to } required>
              {#each wallets as wallet}
                <option value="{ wallet.public }">{ wallet.name }</option>
              {/each}
            </select>
          {:else}
            <input type="text" class="form-control" required placeholder="To" bind:value={ to }>
          {/if}
        </div>

        <div class="form-group">
          <label>Amount</label>
          <input type="text" class="form-control" required placeholder="Amount" bind:value={ amount }>
        </div>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" on:click={ send }>Send</button>
      </div>
    </div>
  </div>
</div>

<script>
import jquery from 'jquery'
import { createEventDispatcher, onMount } from 'svelte'
import { demoMode } from '../../store'
import { sendFunds } from '../../actions'

const dispatch = createEventDispatcher()

export let wallets = []
export let show = false

let from = ''
let to = ''
let amount = ''

$: if (from === '' && wallets.length > 0) from = wallets[0].public
$: if (to === '' && wallets.length > 1) to = wallets[1].public
$: if (show === true) jquery('#send_modal').modal('show')

onMount(() => {
  jquery('#send_modal').on('hidden.bs.modal', function () {
    dispatch('hide')
  })
})

const send = () => {
  sendFunds({from, to, amount})
  jquery('#send_modal').modal('hide')
  amount = ''
}

</script>
