import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import VueKonva from 'vue-konva';
import { Quasar } from 'quasar';
import quasarLang from 'quasar/lang/zh-TW';
import { createPinia } from 'pinia'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';
// Import all of Bootstrap's JS
// import * as bootstrap from 'bootstrap'

// import "./assets/MyVariable.scss";


const app = createApp(App)

app.use(router)
app.use(VueKonva)
const pinia = createPinia()
app.use(pinia)
app.use(Quasar,{
    plugins: {
    },
    lang: quasarLang
})
app.mount('#app')

