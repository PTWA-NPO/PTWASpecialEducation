<template>
  <div ref="konvaContainer" class="clock-container"></div>
</template>

<script>
import Konva from "konva";
import { getSlotComponentAssets } from "@/utilitys/get_assets.js";

export default {
  name: "ElectronicClock",
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
      stage: null,
      layer: null,
      width: 100, // 預設寬度
      height: 100, // 預設高度
      inputTime: this.Data.time == undefined ? "00:00" : this.Data.time, // 默認時間
      scaledImage: { width: 0, height: 0 }, // 儲存縮放後圖片的大小
    };
  },
  mounted() {
    this.drawClock();
  },
  methods: {
    drawClock() {
      const container = this.$refs.konvaContainer.parentElement;
      this.width = container.offsetWidth;
      this.height = container.offsetHeight;

      if (this.stage) {
        this.stage.destroy(); // 清空舊的畫布
      }

      // 創建舞台和層
      this.stage = new Konva.Stage({
        container: this.$refs.konvaContainer,
        width: this.width,
        height: this.height,
      });

      const imageURL = getSlotComponentAssets("Clock", "electronic-clock.png");
      const backgroundLayer = new Konva.Layer();
      const backgroundImage = new Konva.Image();

      const imageObj = new Image();
      imageObj.onload = () => {
        // 正確存儲圖片原始寬高
        this.imageWidth = imageObj.width;
        this.imageHeight = imageObj.height;

        const scale = this.calculateScale(
          this.width,
          this.height,
          this.imageWidth,
          this.imageHeight
        );

        this.scaledImage.width = this.imageWidth * scale;
        this.scaledImage.height = this.imageHeight * scale;

        const { x: offsetX, y: offsetY } = this.calculateOffset(
          this.width,
          this.height,
          this.scaledImage.width,
          this.scaledImage.height
        );

        backgroundImage.image(imageObj);
        backgroundImage.width(this.imageWidth);
        backgroundImage.height(this.imageHeight);
        backgroundImage.scale({ x: scale, y: scale });
        backgroundImage.position({ x: offsetX, y: offsetY });

        backgroundLayer.add(backgroundImage);
        backgroundLayer.draw();

        // 繪製時間
        this.drawTime(this.inputTime || "00:00"); // 確保有初始值
      };
      imageObj.src = imageURL;
      this.stage.add(backgroundLayer);

      this.layer = new Konva.Layer();
      this.stage.add(this.layer);
    },
    drawTime(time) {
      if (this.scaledImage.width <= 0 || this.scaledImage.height <= 0) {
        console.warn("圖片尚未加載完成，無法繪製時間");
        return;
      }

      // 清空層
      this.layer.destroyChildren();

      const timeArray = time.split(":");
      const hours = [...timeArray[0]];
      const minutes = [...timeArray[1]];

      // 使用縮放後的圖片寬度計算數字大小
      const digitWidth = this.scaledImage.width * 0.15;
      const digitHeight = digitWidth * 1.3;

      // 計算文字的起始偏移量，確保文字居中
      const totalDigits = hours.length + 1 + minutes.length; // 小時 + 分號 + 分鐘
      const totalWidth = totalDigits * digitWidth;

      const { x: offsetX, y: offsetY } = this.calculateOffset(
        this.width,
        this.height,
        totalWidth,
        digitHeight
      );

      // 繪製小時部分
      hours.forEach((char, index) => {
        this.drawDigit(char, offsetX + index * digitWidth, offsetY, digitWidth);
      });

      // 繪製分號部分
      this.drawColon(offsetX + hours.length * digitWidth, offsetY, digitWidth);

      // 繪製分鐘部分
      minutes.forEach((char, index) => {
        this.drawDigit(
          char,
          offsetX + (hours.length + 1) * digitWidth + index * digitWidth,
          offsetY,
          digitWidth
        );
      });

      this.layer.draw();
    },
    drawDigit(digit, x, y, size) {
      if (size <= 0) {
        console.warn("數字大小無效，無法繪製");
        return;
      }

      const longSide = size * 0.5;
      const shortSide = size * 0.1;
      const shapes = [
        { x: x + shortSide, y: y, width: longSide, height: shortSide }, // Top
        {
          x: x + shortSide + longSide,
          y: y + shortSide,
          width: shortSide,
          height: longSide,
        }, // Top-right
        {
          x: x + shortSide + longSide,
          y: y + shortSide * 2 + longSide,
          width: shortSide,
          height: longSide,
        }, // Bottom-right
        {
          x: x + shortSide,
          y: y + (shortSide + longSide) * 2,
          width: longSide,
          height: shortSide,
        }, // Bottom
        {
          x: x,
          y: y + shortSide * 2 + longSide,
          width: shortSide,
          height: longSide,
        }, // Bottom-left
        { x: x, y: y + shortSide, width: shortSide, height: longSide }, // Top-left
        {
          x: x + shortSide,
          y: y + shortSide + longSide,
          width: longSide,
          height: shortSide,
        }, // Middle
      ];

      // 繪製段顯示
      const digitMap = {
        0: [0, 1, 2, 3, 4, 5],
        1: [1, 2],
        2: [0, 1, 3, 4, 6],
        3: [0, 1, 2, 3, 6],
        4: [1, 2, 5, 6],
        5: [0, 2, 3, 5, 6],
        6: [0, 2, 3, 4, 5, 6],
        7: [0, 1, 2],
        8: [0, 1, 2, 3, 4, 5, 6],
        9: [0, 1, 2, 3, 5, 6],
      };

      digitMap[digit].forEach((segmentIndex) => {
        const { x, y, width, height } = shapes[segmentIndex];
        const rect = new Konva.Rect({
          x,
          y,
          width,
          height,
          fill: "#0f0",
          shadowColor: "#0f0",
          shadowBlur: 5,
        });
        this.layer.add(rect);
      });
    },
    drawColon(x, y, size) {
      const topDot = new Konva.Circle({
        x: x + size * 0.4,
        y: y + size * 0.4,
        radius: size * 0.1,
        fill: "#0f0",
        shadowColor: "#0f0",
        shadowBlur: 4,
      });
      const bottomDot = new Konva.Circle({
        x: x + size * 0.4,
        y: y + size * 0.8,
        radius: size * 0.1,
        fill: "#0f0",
        shadowColor: "#0f0",
        shadowBlur: 4,
      });

      this.layer.add(topDot, bottomDot);
    },
    updateTime() {
      this.drawTime(this.inputTime);
    },
    calculateScale(containerWidth, containerHeight, imageWidth, imageHeight) {
      const scaleX = containerWidth / imageWidth;
      const scaleY = containerHeight / imageHeight;
      return Math.min(scaleX, scaleY); // 縮放比例
    },
    calculateOffset(
      containerWidth,
      containerHeight,
      scaledWidth,
      scaledHeight
    ) {
      return {
        x: (containerWidth - scaledWidth) / 2,
        y: (containerHeight - scaledHeight) / 2,
      };
    },
  },
};
</script>

<style scoped>
.clock-container {
  width: 100%;
  height: 100%;
  min-width: 60px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
