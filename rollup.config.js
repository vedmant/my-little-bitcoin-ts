import fs from 'fs'
import vue from 'rollup-plugin-vue'
import copy from 'rollup-plugin-copy'
import scss from 'rollup-plugin-scss'
import serve from 'rollup-plugin-serve'
import buble from 'rollup-plugin-buble'
import uglify from 'rollup-plugin-uglify'
import cssnano from 'cssnano'
import postcss from 'postcss'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import nodeResolve from 'rollup-plugin-node-resolve'
import nodeGlobals from 'rollup-plugin-node-globals'
import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'
import autoprefixer from 'autoprefixer'

if(fs.existsSync('./dist/app.js.map')) fs.unlinkSync('./dist/app.js.map')

let plugins = [
   babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
   }),
   json(),
   // alias({ vue$: 'vue/dist/vue.common.js' }),
   vue({autoStyles: false, styleToImports: true}),
   scss({
      output: 'dist/app.css',
      processor: css => postcss([autoprefixer, cssnano]).process(css, {from: undefined}).then(result => result.css)
   }),
   buble({
      objectAssign: 'Object.assign',
      transforms: {
         dangerousForOf: true,
      },
   }),
   nodeResolve({
      jsnext: true,
      main: true,
      browser: true
   }),
   commonjs(),
   nodeGlobals(),
   copy({targets: {src: 'client/index.html', dest: 'dist'}}),

   process.env.NODE_ENV === 'prod' && replace({'process.env.NODE_ENV': JSON.stringify('production')}),
   process.env.NODE_ENV === 'prod' && uglify(),
   process.env.NODE_ENV !== 'prod' && process.env.PORT !== undefined && livereload(),
   process.env.PORT !== undefined && serve({
      contentBase: './dist/',
      port: process.env.PORT,
      open: true
   }),
]

let config = {
   input: 'client/app.js',
   output: {
      dir: 'dist',
      format: 'cjs',
      sourcemap: process.env.NODE_ENV !== 'prod'
   },
   manualChunks: {
      'vendor': [
         'vue',
         'vue-router',
         'vuex',
         'moment-mini',
         'jquery',
         'axios',
      ]
   },
   plugins: plugins,
}

export default config
