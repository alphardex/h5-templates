import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import NotFound from "../views/NotFound.vue";
import Prize from "../views/Prize.vue";
import Game from "../views/Game.vue";
import Rule from "../views/Rule.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/prize",
    name: "Prize",
    component: Prize,
  },
  {
    path: "/game",
    name: "Game",
    component: Game,
  },
  {
    path: "/rule",
    name: "Rule",
    component: Rule,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.name !== from.name) {
      return { top: 0, left: 0 };
    }
  },
});

export default router;
