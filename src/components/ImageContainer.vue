<template>
  <div id="ImageContainer" ref="ImageContainer" class="image-container">
    <img id="Img" ref="Image" :src="imageUrl" :alt="componentConfig.Alt" />
  </div>
</template>
<script>
import { getGameAssets } from "@/lib/get-assets.js";

export default {
  name: "ImageContainer",
  props: {
    gameId: {
      type: String,
      required: true,
    },
    componentConfig: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      imageUrl: "",
    };
  },
  mounted() {
    this.imageUrl = getGameAssets(this.gameId, this.componentConfig.Src);
  },
  methods: {},
};
</script>

<style scoped lang="scss">
.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: 100%;
  max-width: 100%;
}
</style>



