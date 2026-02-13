<template>
  <div class="layout">
    <!-- 可選：如果頁面有提供 header slot 就會出現 -->
    <header class="layout__header">
      <slot name="header" />
    </header>

    <main class="layout__main">
      <slot />
    </main>

    <footer class="layout__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup></script>

<style scoped lang="scss">
.layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  &__header {
    width: 100%;
    background-color: #f4c49f;
    height: 10vh;
    display: block;
    position: sticky;
  }
}
.layout__header:empty,
.layout__footer:empty {
  display: none;
} /* 沒提供就不佔位 */
.layout__main {
  flex: 1;
}
</style>
