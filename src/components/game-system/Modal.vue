<template>
  <Teleport to="body">
    <div class="system-modal" @click="close">
      <div class="system-modal__body" @click.stop>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "Modal",
  emits: ["close"],
  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped lang="scss">
.system-modal {
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.5);
}

.system-modal__body {
  background-color: white;
  padding: 2rem;
  @extend .container-basic;
}
</style>
