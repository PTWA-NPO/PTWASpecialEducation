<template>
  <div class="word">
    <p ref="textOnlyContainer">
      {{ componentConfig.Text }}
    </p>
  </div>
</template>
<script>
import { FONT_PACK } from "@/lib/get-scss-variables.js";
export default {
  name: "TextOnly",
  props: {
    componentConfig: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    if (this.componentConfig.Size) {
      const container = this.$refs.textOnlyContainer;
      if (this.componentConfig.Size === "large") {
        container.style.fontSize = `${FONT_PACK["TEXT_LARGE"]}`;
      } else if (this.componentConfig.Size === "medium") {
        container.style.fontSize = `${FONT_PACK["TEXT_MEDIUM"]}`;
      } else if (this.componentConfig.Size === "small") {
        container.style.fontSize = `${FONT_PACK["TEXT_SMALL"]}`;
      } else if (this.componentConfig.Size === "tiny") {
        container.style.fontSize = `${FONT_PACK["TEXT_TINY"]}`;
      } else if (this.componentConfig.Size === "title-large") {
        container.style.fontSize = `${FONT_PACK["TITLE_LARGE"]}`;
      } else if (this.componentConfig.Size === "title-medium") {
        container.style.fontSize = `${FONT_PACK["TITLE_MEDIUM"]}`;
      } else if (this.componentConfig.Size === "title-small") {
        container.style.fontSize = `${FONT_PACK["TITLE_SMALL"]}`;
      } else {
        container.style.fontSize = this.componentConfig.Size;
      }
    } else {
      const container = this.$refs.textOnlyContainer;
      container.style.fontSize = `${FONT_PACK["TEXT_MEDIUM"]}`;
    }
  },
};
</script>
<style scoped lang="scss">
/* Your component's CSS styles go here */
div {
  width: 100%;
  height: 100%;
  display: table;
  p {
    display: table-cell;
    vertical-align: middle;
    text-align: center;
  }
}
</style>

