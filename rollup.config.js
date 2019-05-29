import babel from 'rollup-plugin-babel'
import {eslint} from 'rollup-plugin-eslint'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import {uglify} from 'rollup-plugin-uglify'
export default {
  input: 'src/dropcap.js',
  output: {
    file: 'dist/js/dropcap.min.js',
    format: 'umd',
    name: 'DropCap'
  },
  plugins: [
    resolve({
      mainFields: ['module', 'main', 'browser']
    }),
    commonjs(),
    uglify(),
    babel({
      exclude: 'node_modules/**'
    }),
    eslint({
      throwOnError: true,
      throwOnWarning: true,
      include: ['src/**'],
      exclude: ['node_modules/**']
    })
  ]
}