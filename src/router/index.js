import VueRouter from "vue-router";

import Index from "@/page/index";
import External from "@/page/external";

const routes = [
  {
    name: "index",
    path: "/",
    component: Index,
  },
  {
    name: "external",
    path: "/external",
    component: External,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
