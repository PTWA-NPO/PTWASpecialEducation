<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

// 取得當前路由
const route = useRoute();

// 動態取得當前匹配的路由組件
const currentComponent = computed(() => {
  const matched = route.matched;
  if (matched.length > 0) {
    return matched[matched.length - 1].components.default;
  }
  return null;
});

// 提取路由參數
const currentParams = computed(() => route.params);
</script>

<template>
  <!-- eslint-disable-next-line vue/no-template-shadow -->
  <router-view v-slot="{ route }">
    <transition :name="route.meta.transition || 'fade'">
      <!-- 動態渲染組件，並傳遞路由參數 -->
      <component
        :is="currentComponent"
        :key="route.path"
        v-bind="currentParams"
      />
    </transition>
  </router-view>
</template>

<style lang="scss">
@font-face {
  font-family: "YuanQuan";
  src: url("@/assets/fonts/YuanQuan/BpmfGenSenRounded-M.ttf") format("truetype");
}
.navbar {
  background-color: #57b9d9;
  height: 10vh;
  width: 100%;
  margin: 0;
  .navbar-brand {
    img {
      max-width: 70%;
    }
  }
  img {
    max-width: 80%;
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
