<div style="position: fixed; z-index: 99999; right: 20px; top: 20px;">
  {#each $toasts as message (message.id)}
    <div class="toast show" data-id={message.id} transition:fade|local>
      <div class="toast-header">
        <strong class="mr-auto text-primary">Notification</strong>
        <button type="button" class="ml-2 mb-1 close" on:click={() => remove(message.id)}>&times;</button>
      </div>
      <div class="toast-body">
        { message.text }
      </div>
    </div>
  {/each}
</div>

<script>
import { fade } from 'svelte/transition'
import {toasts} from '../store'

const hide = (id) => {
  setTimeout(() => {
    remove(id)
  }, 200)
}

const remove = (id) => {
  toasts.update(msgs => {
    return msgs.filter(m => m.id !== id)
  })
}

</script>
