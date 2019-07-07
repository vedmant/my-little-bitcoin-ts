<Router url="{url}">

  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <a class="navbar-brand" href="#">My Little Bitcoin</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav">
        <li class="github-menu-item nav-item">
          <a class="nav-link github-button" href="https://github.com/vedmant/my-little-bitcoin" data-size="large" data-show-count="true" aria-label="Star vedmant/my-little-bitcoin on GitHub">Star</a>
        </li>
      </ul>

      <ul class="navbar-nav ml-auto">
        <li class="nav-item {url === '/' ? 'active' : ''}">
          <a href="/" class="nav-link" use:link>Status</a>
        </li>
        <li class="nav-item">
          <a href="wallets" class="nav-link" use:link>Wallets</a>
        </li>
      </ul>
    </div>
  </nav>

  <div class="container">
    <Route path="/" component={Home} />
    <Route path="about" component={About} />
  </div>
</Router>

{url}

<script>
import { Router, Route, link } from 'svelte-routing'
import Navbar from './components/Navbar.svelte'
import About from './components/About.svelte'
import Home from './components/Home.svelte'

export let url = '/'
</script>
