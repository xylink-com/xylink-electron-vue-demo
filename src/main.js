import Vue from "vue";
import App from "./App.vue";
import VueRouter from "vue-router";
import router from "./router";
import "./plugins/element.js";
import "./style/global.index.css";
import { createPinia, PiniaVuePlugin } from 'pinia';
import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard);
Vue.use(PiniaVuePlugin);
Vue.use(VueRouter);
Vue.config.productionTip = false;

const pinia = createPinia()


new Vue({
  router,
  pinia,
  render: (h) => h(App),
}).$mount("#app");
