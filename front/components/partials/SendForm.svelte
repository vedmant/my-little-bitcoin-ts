<b-modal :visible="value" @change="value => $emit('input', value)" title="Send MLB to" ok-title="Send" @ok="onSendSubmit">
  <b-form @submit.prevent="onSendSubmit">
    <b-form-group label="From">
      <b-form-select v-model="send.from" :options="wallets.map(w => ({value: w.public, text: w.name}))"></b-form-select>
    </b-form-group>
    <b-form-group label="To">
      <b-form-select v-if="demoMode" v-model="send.to" :options="wallets.map(w => ({value: w.public, text: w.name}))"></b-form-select>
      <b-form-input v-else type="text" v-model="send.to" required placeholder="To"></b-form-input>
    </b-form-group>
    <b-form-group label="Amount">
      <b-form-input type="text" v-model="send.amount" required placeholder="Amount"></b-form-input>
    </b-form-group>
    <input type="submit" style="position: absolute; left: -9999px"/>
  </b-form>
</b-modal>

<div class="modal" tabindex="-1" role="dialog">
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
          <label for="exampleInputEmail1">Email address</label>
          <select class="form-control" bind:value="address">
            {#each wallets as wallet}
              <option value="{ wallet.address }">{ wallet.address }</option>
            {/each}
          </select>
          <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email">
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Send</button>
      </div>
    </div>
  </div>
</div>
