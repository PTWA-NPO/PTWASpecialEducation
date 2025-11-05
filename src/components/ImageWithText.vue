<template>
  <div class="image-with-text">
    <ImageContainer
      :game-id="gameId"
      :component-config="{ Src: componentConfig.Src, Alt: componentConfig.Alt }"
    />
    <p class="h1">
      {{ text }}
    </p>
  </div>
</template>
<script>
import { getGameAssets } from "@/lib/get-assets.js";
import ImageContainer from "@/components/ImageContainer.vue";
export default {
  name: "ImageWithText",
  components: {
    ImageContainer,
  },
  props: {
    componentConfig: {
      type: Object,
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      imageUrl: "",
      text: "",
    };
  },
  mounted() {
    // Your code here
    this.imageUrl = getGameAssets(this.gameId, this.componentConfig.Src);
    this.text = this.componentConfig.Text;
  },
};
</script>

<style scoped lang="scss">
.image-with-text {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  ImageContainer {
    width: 100%;
    height: 70%;
    border: solid;
  }
}
</style>



