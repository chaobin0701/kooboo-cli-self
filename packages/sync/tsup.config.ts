import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'esnext',
  outDir: 'dist',
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  esbuildOptions(options) {
    options.plugins = [
      {
        name: 'add-js-extension',
        setup(build) {
          build.onResolve({ filter: /^\.+\// }, (args) => {
            if (/\.(js|ts|json)$/.test(args.path)) return
            return {
              path: args.path + '.js',
              namespace: 'file'
            }
          })
        }
      }
    ]
  }
})
