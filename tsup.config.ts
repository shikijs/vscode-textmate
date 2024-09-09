import { defineConfig } from 'tsup'
import { promises as fs } from 'fs'

export default defineConfig({
  dts: true,
  clean: true,
  entry: ['src/index.ts'],
  format: ['esm'],
  esbuildPlugins: [
    {
      name: 'replace',
      setup(build) {
        build.onLoad({ filter: /\.ts$/ }, async ({ path }) => {
          const code = await fs.readFile(path, 'utf-8')
          return {
            loader: 'ts',
            contents: code.replace(/DebugFlags\.InDebugMode/g, 'false'),
          }
        })
      },
    },
  ],
})
