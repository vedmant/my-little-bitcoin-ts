<nav class="navbar navbar-expand-lg navbar-dark bg-info">
  <div class="container">
    <a class="navbar-brand" href="/" use:link>My Little Bitcoin</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav">
        <li class="github-menu-item nav-item">
          <a class="nav-link github-button" href="https://github.com/vedmant/my-little-bitcoin-ts" data-size="large" data-show-count="true" aria-label="Star vedmant/my-little-bitcoin on GitHub">Star</a>
        </li>
      </ul>

      <ul class="navbar-nav ml-auto">
        <li class="nav-item">
          <a href="/" class="nav-link" use:link use:active>Status</a>
        </li>
        <li class="nav-item">
          <a href="/wallets" class="nav-link" use:link use:active>Wallets</a>
        </li>
      </ul>
    </div>
  </div>
</nav>

<script>
import {link} from 'svelte-spa-router'
import active from 'svelte-spa-router/active'
import { onMount } from 'svelte'

onMount(() => {
  loadGithubScript()
})

const loadGithubScript = () => {
  const script = document.createElement('script')
  script.src = 'https://buttons.github.io/buttons.js'
  document.head.appendChild(script)
}
</script>
