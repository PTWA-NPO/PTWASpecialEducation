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
      component: () => import("@/views/HomePage.vue"),
    },
    //將遊戲選擇整合至一個頁面
    {
      path: "/:id",
      name: "GameSelect",
      meta: { transition: "fade" },
      component: () => import("@/views/GameSelect.vue"),
    },
    {
      path: "/:Grade/:Subject/:id/:GameName",
      name: "Game",
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
  const grade = parseInt(to.params.Grade, 10);
  const id = parseInt(to.params.id, 10);
  if ((!isNaN(grade) && grade > 3) || (!isNaN(id) && id > 3)) {
    document.body.style.fontFamily = ""; // 當年級或ID大於3時使用默認字體
  } else {
    document.body.style.fontFamily = "YuanQuan, sans-serif"; // 其他情況使用YuanQuan字體
  }
  next();
});

export default router;
