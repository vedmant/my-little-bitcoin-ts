const sass = require('node-sass')

module.exports = {
   preprocess: require('svelte-preprocess')({
      transformers: {
         scss: true,
      }
   })
}
