<template>
  <div id="ImageContainer" ref="ImageContainer" class="image-container">
    <img id="Img" ref="Image" :src="imageUrl" :alt="Data.Alt" />
  </div>
</template>
<script>
import { getGameAssets } from "@/utilitys/get_assets.js";

export default {
  name: "ImageContainer",
  props: {
    ID: {
      type: String,
      required: true,
    },
    Data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      imageUrl: "",
      ContainerSize: {
        width: 0,
        height: 0,
      },
    };
  },
  mounted() {
    this.imageUrl = getGameAssets(this.ID, this.Data.Src);
    console.log(this.imageUrl, this.Data.Alt, this.ID, this.Data.Src);
  },
  methods: {
    Init() {
      const img = new Image();
      img.onload = () => {
        let ImageDatas = {
          width: img.width,
          height: img.height,
        };
        // Height First
        let New = this.GetScaledDimensions(
          this.ContainerSize.width,
          this.ContainerSize.height,
          ImageDatas.width,
          ImageDatas.height
        );
        let newHeight = New.height;
        let newWidth = New.width;
        let ApplyImage = document.getElementById("Img");
        ApplyImage.style.width = newWidth + "px";
        ApplyImage.style.height = newHeight + "px";
        console.log(newHeight, newWidth);
      };
      img.src = this.imageUrl;
    },
    GetScaledDimensions(
      containerWidth,
      containerHeight,
      imageWidth,
      imageHeight
    ) {
      // 計算寬和高的比例
      const widthRatio = containerWidth / imageWidth;
      const heightRatio = containerHeight / imageHeight;

      // 選擇較小的比例來確保圖片完全放入容器中
      const scale = Math.min(widthRatio, heightRatio);

      // 計算縮放後的圖片尺寸
      const scaledWidth = imageWidth * scale;
      const scaledHeight = imageHeight * scale;

      return { width: scaledWidth, height: scaledHeight };
    },
  },
};
</script>

<style scoped lang="scss">
.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
