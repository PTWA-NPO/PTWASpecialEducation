<template>
  <div class="repeat-image-container">
    <img
      v-for="index in count"
      :key="index"
      :src="imageUrl"
      :alt="Data.Alt"
      class="repeated-image"
    />
  </div>
</template>

<script>
import { getGameAssets } from "@/utilitys/get_assets.js";
export default {
  name: "RepeatImage",
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
    return {
      count: this.Data.Count,
      imageUrl: getGameAssets(this.ID, this.Data.Src),
    };
  },
};
</script>

<style scoped>
.repeat-image-container {
  display: grid;
  width: 100%;
  height: 100%;
  padding: 4px;
  box-sizing: border-box;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
  place-items: center;
}

.repeated-image {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  object-fit: contain;
}
</style>
