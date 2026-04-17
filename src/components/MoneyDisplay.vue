<template>
  <div class="image-container">
    <img :src="imgUrl" class="monay-image" />
  </div>
</template>

<script>
import { getSlotComponentAssets } from "@/lib/get-assets.js";
export default {
  props: {
    componentConfig: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      moneyImgFile: "MoneyGenerator",
      denomination: null,
      imgUrl: "",
      fileExtension: ".png",
    };
  },
  mounted() {
    this.denomination = this.componentConfig.denomination.toString();
    this.denomination = this.denomination + this.fileExtension;
    this.imgUrl = getSlotComponentAssets(this.moneyImgFile, this.denomination);
  },
  methods: {},
};
</script>

<style scoped lang="scss">
.image-container {
  display: flex;
  justify-content: start;
  align-items: start;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.monay-image {
  object-fit: contain;
  max-height: 100%;
  max-width: 100%;
}
</style>
