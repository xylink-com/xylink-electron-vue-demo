import Index from "@/page/index";
import External from "@/page/external";
import { createRouter, createWebHashHistory } from 'vue-router'

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

const router = createRouter({
  routes,
  history: createWebHashHistory(),
});

export default router;
