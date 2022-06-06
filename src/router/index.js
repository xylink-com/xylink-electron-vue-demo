import VueRouter from "vue-router";

import Index from "@/page/index";
import Slave from "@/page/slave";

const routes = [
  {
    name: "index",
    path: "/",
    component: Index,
  },
  {
    name: "slave",
    path: "/slave",
    component: Slave,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
