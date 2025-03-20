import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { readFile } from 'fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'
import { summary } from 'rollup-plugin-summary'
import { minify, swc } from 'rollup-plugin-swc3'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'

const isProd = process.env.NODE_ENV !== 'development',
  __dirname = path.dirname(fileURLToPath(import.meta.url)),
  /**
   * @type {typeof import('./package.json')}
   * */
  pkg = JSON.parse(
    (
      await readFile(
        new URL(path.resolve(__dirname, 'package.json'), import.meta.url)
      )
    ).toString()
  ),
  input = path.resolve(__dirname, 'src', 'index.ts'),
  /**
   * @type {import('rollup').RollupOptions}
   * */
  unpkg = {
    input,
    // onwarn(warning, warn) {
    //   if (warning.code === 'CIRCULAR_DEPENDENCY') {
    //     return
    //   }
    //   warn(warning)
    // },
    output: {
      exports: 'named',
      extend: true,
      file: pkg.main,
      format: 'iife',
      name: pkg.name,
    },
    plugins: [
      typescriptPaths(),
      nodeResolve({
        extensions: ['.ts'],
      }),
      commonjs(),
      swc(),
      isProd && minify(),
      isProd && summary(),
      !isProd &&
        serve({
          open: true,
        }),
      !isProd && livereload(),
    ],
  }

export default unpkg
