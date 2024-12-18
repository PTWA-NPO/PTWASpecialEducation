import {fileURLToPath, URL} from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

import inject from '@rollup/plugin-inject'
export default defineConfig({
    base: '/PTWASpecialEducation/',
    plugins: [
        vue(),
        inject({
            $: "jquery", 
            jQuery: "jquery",
            "windows.jQuery": "jquery",
            include: ['**/*.js'], // 僅作用於 JavaScript 文件
        }),
        quasar({
            sassVariables: 'src/quasar-variables.sass'
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: '@import "@/scss/main.scss";'
            }
        }
    },
})