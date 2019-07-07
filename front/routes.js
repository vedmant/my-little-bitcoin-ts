// Import all necessary view components here
import Home from './components/Home.html'
import About from './components/About.html'

export default {
  // hash - will handle URLs like localhost:8080/#/sub1/sub2
  // history - common URLs like localhost:8080/sub1/sub2
  // Note: On production server you should manually set rewrite all requests to index.html
  mode: 'history',

  // Each route should have imported component from views directory
  routes: {
    '/': Home,
    '/about': About
  }
}
