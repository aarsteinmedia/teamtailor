import { nodeResolve } from '@rollup/plugin-node-resolve'
import autoprefixer from 'autoprefixer'
import { readFile } from 'fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import flexbugs from 'postcss-flexbugs-fixes'
import { dts } from 'rollup-plugin-dts'
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
   * @type {import('rollup').RollupOptions.InputPluginOption}
   * */
  plugins = (preferBuiltins = false) => [
    typescriptPaths(),
    postcss({
      inject: false,
      plugins: isProd
        ? [
            flexbugs(),
            autoprefixer({
              flexbox: 'no-2009',
            }),
          ]
        : [],
    }),
    template({
      include: [
        path.resolve(__dirname, 'src', 'elements', 'DotLottiePlayer.ts'),
        path.resolve(__dirname, 'src', 'templates', '*'),
      ],
      options: {
        shouldMinify({ parts }) {
          return parts.some(
            ({ text }) =>
              text.includes('<figure') ||
              text.includes('<div') ||
              text.includes('<svg')
          )
        },
      },
    }),
    json({
      compact: true,
    }),
    nodeResolve({
      extensions: ['.ts'],
      preferBuiltins,
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
  /**
   * @type {import('rollup').RollupOptions}
   * */
  unpkg = {
    input,
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        return
      }
      warn(warning)
    },
    output: {
      exports: 'named',
      extend: true,
      file: pkg.unpkg,
      format: 'iife',
      name: pkg.name,
    },
    plugins: plugins(),
  }

export default unpkg
