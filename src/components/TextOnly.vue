<template>
  <div class="word">
    <p ref="textOnlyContainer">
      {{ Data.Text }}
    </p>
  </div>
</template>
<script>
import { FONT_PACK } from "@/utilitys/get-scss-variables";
export default {
  name: "TextOnly",
  props: {
    Data: {
      type: Object,
      required: true,
    },
    ID: {
      type: String,
      required: true,
    },
  },
  data() {
    return {};
  },
  mounted() {
    console.log(FONT_PACK["TEXT_LARGE"]);
    if (this.Data.Size) {
      const container = this.$refs.textOnlyContainer;
      if (this.Data.Size == "large") {
        container.style.fontSize = `${FONT_PACK["TEXT_LARGE"]}`;
      } else if (this.Data.Size == "medium") {
        container.style.fontSize = `${FONT_PACK["TEXT_MEDIUM"]}`;
      } else if (this.Data.Size == "small") {
        container.style.fontSize = `${FONT_PACK["TEXT_SMALL"]}`;
      } else if (this.Data.Size == "tiny") {
        container.style.fontSize = `${FONT_PACK["TEXT_TINY"]}`;
      } else if (this.Data.Size == "title-large") {
        container.style.fontSize = `${FONT_PACK["TITLE_LARGE"]}`;
      } else if (this.Data.Size == "title-medium") {
        container.style.fontSize = `${FONT_PACK["TITLE_MEDIUM"]}`;
      } else if (this.Data.Size == "title-small") {
        container.style.fontSize = `${FONT_PACK["TITLE_SMALL"]}`;
      } else {
        container.style.fontSize = this.Data.Size;
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
