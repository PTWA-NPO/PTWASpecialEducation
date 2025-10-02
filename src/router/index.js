import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      meta: {
        requiresAuth: false,
        transition: "fade",
      },
      component: () => import("@/features/home/pages/HomePage.vue"),
    },
    //將遊戲選擇整合至一個頁面
    {
      path: "/:grade",
      name: "GameBrowser",
      meta: { transition: "fade" },
      component: () => import("@/features/game-browser/pages/GameBrowser.vue"),
    },
    {
      path: "/:grade/:subject/:id/:gameName",
      name: "game",
      meta: { transition: "fade" },
      component: () => import("@/views/GameInterface.vue"),
    },
    {
      path: "/DrawImage",
      name: "DrawImage",
      component: () => import("@/components/DrawImage.vue"),
    },
    {
      path: "/NumberBoard",
      name: "NumberBoard",
      component: () => import("@/components/NumberBoard.vue"),
    },
    {
      path: "/Numberline",
      name: "Numberline",
      component: () => import("@/components/NumberLine.vue"),
    },
    {
      path: "/tester",
      component: () => import("@/views/GameTemplate/componentTesters.vue"),
    },
    {
      path: "/LinktoImageGameMaker",
      component: () => import("@/components/maker/LinktoImageGameMaker.vue"),
    },
  ],
});
router.beforeEach((to, from, next) => {
  console.warn(`route: ${from.path} -> ${to.path}`);
  const normalizeParam = (value) => (Array.isArray(value) ? value[0] : value);
  const grade = parseInt(normalizeParam(to.params.grade), 10);
  const id = parseInt(normalizeParam(to.params.id), 10);
  if ((!isNaN(grade) && grade > 3) || (!isNaN(id) && id > 3)) {
    document.body.style.fontFamily = ""; // ?�年級�?ID大於3?�使?��?認�?�?
  } else {
    document.body.style.fontFamily = "YuanQuan, sans-serif"; // ?��??��?使用YuanQuan字�?
  }
  next();
});

export default router;
