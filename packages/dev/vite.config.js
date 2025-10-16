import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	plugins: [vue(), dts()],
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: 'BlossomCarousel',
			fileName: 'blossom-carousel-test',
		},
		rollupOptions: {
			// Don't bundle Vue, expect the app to provide it
			external: ['vue', '@blossom-carousel/core'],
			output: {
				globals: {
					vue: 'Vue',
					'@blossom-carousel/core': 'BlossomCarouselCore',
				},
			},
		},
	},
})
