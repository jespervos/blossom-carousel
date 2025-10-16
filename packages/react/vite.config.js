import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	plugins: [react(), dts()],
	resolve: {
		alias: {
			'@blossom-carousel/core': path.resolve(__dirname, '../core/src'),
		},
	},
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: 'BlossomCarousel',
			fileName: 'blossom-carousel-react',
		},
		rollupOptions: {
			external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', '@blossom-carousel/core'],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
					'react/jsx-runtime': 'React',
					'react/jsx-dev-runtime': 'React',
					'@blossom-carousel/core': 'BlossomCarouselCore',
				},
			},
		},
	},
})
