import { createApp } from 'vue';
import { createPinia } from 'pinia';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from "./App.vue";
import router from "./router";

import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import "./style/global.index.css";

import VueClipboard from 'vue3-clipboard'

const pinia = createPinia();
const app = createApp(App);

for (const [key, comp] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, comp);
}

app.use(ElementPlus);
app.use(pinia);
app.use(router);
app.use(VueClipboard, {
    autoSetContainer: true,
    appendToBody: true,
})


app.mount("#app");
