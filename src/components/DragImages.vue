<template>
  <div ref="container" class="gameContainer">
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect
          v-if="componentConfig.backgroundType === 'color'"
          :config="configBG"
        />
        <v-image
          v-if="componentConfig.backgroundType === 'image'"
          :config="configBG"
        />
      </v-layer>

      <v-layer>
        <v-image
          v-for="(image, index) in configImage"
          :key="index"
          :config="image"
          :listening="image.draggable"
          @dragmove="handleDragmove"
          @dragend="handleDragend"
        />
      </v-layer>
      <v-layer v-if="componentConfig.backgroundType === 'grid'">
        <v-line
          v-for="(pointSet, index) in configBG"
          :key="index"
          :points="pointSet"
          :stroke="'black'"
        />
      </v-layer>
      <v-layer>
        <v-rect :config="configRotationPanel" />
        <v-image
          v-for="(arrow, index) in configArrows"
          :key="index"
          :config="arrow"
          @click="rotateImage"
          @tap="rotateImage"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { getGameAssets } from "@/lib/get-assets.js";
import { getSystemAssets } from "@/lib/get-assets.js";
export default {
  components: {},
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
      configKonva: {},
      configBG: [],
      gridPos: {
        x: [],
        y: [],
      },
      configImage: [],
      images: [],
      configRotationPanel: null,
      configArrows: [],
    };
  },

  mounted() {
    this.initializeScene();
    this.drawBackground();
    this.drawImages();
  },

  methods: {
    initializeScene() {
      if (
        this.$refs.container.clientWidth *
          this.componentConfig.backgroundRatio.height <=
          this.$refs.container.clientHeight *
            this.componentConfig.backgroundRatio.width ||
        this.$refs.container.clientHeight === 0
      ) {
        this.gameWidth = this.$refs.container.clientWidth;
        this.gameHeight =
          (this.gameWidth * this.componentConfig.backgroundRatio.height) /
          this.componentConfig.backgroundRatio.width;
      } else {
        this.gameHeight = this.$refs.container.clientHeight;
        this.gameWidth =
          (this.gameHeight * this.componentConfig.backgroundRatio.width) /
          this.componentConfig.backgroundRatio.height;
      }

      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameHeight;
      this.configBG.width = this.gameWidth;
      this.configBG.height = this.gameHeight;
    },
    drawBackground() {
      switch (this.componentConfig.backgroundType) {
        case "grid":
          this.setGrid();
          this.drawGrid();
          break;
        case "color":
          this.configBG = {
            x: 0,
            y: 0,
            width: this.gameWidth,
            height: this.gameHeight,
            fill: this.componentConfig.background,
            strokeEnabled: false,
          };
          break;
        case "image": {
          const image = new window.Image();
          image.src = getGameAssets(
            this.gameId,
            this.componentConfig.background
          );
          this.configBG = {
            x: 0,
            y: 0,
            width: this.gameWidth,
            height: this.gameHeight,
            image,
            strokeEnabled: false,
          };
          break;
        }
      }
    },
    setGrid() {
      for (let i = 0; i <= this.componentConfig.backgroundRatio.width; ++i)
        this.gridPos.x.push(
          (i * this.gameWidth) / this.componentConfig.backgroundRatio.width
        );
      for (let i = 0; i <= this.componentConfig.backgroundRatio.height; ++i)
        this.gridPos.y.push(
          (i * this.gameHeight) / this.componentConfig.backgroundRatio.height
        );
    },
    drawGrid() {
      this.configBG = [];
      for (let i = 1; i < this.componentConfig.backgroundRatio.width; ++i) {
        this.configBG.push([
          this.gridPos.x[i],
          0,
          this.gridPos.x[i],
          this.gameHeight,
        ]);
      }
      for (let i = 1; i < this.componentConfig.backgroundRatio.height; ++i) {
        this.configBG.push([
          0,
          this.gridPos.y[i],
          this.gameWidth,
          this.gridPos.y[i],
        ]);
      }
    },
    drawImages() {
      this.ratioLength =
        this.gameWidth / this.componentConfig.backgroundRatio.width;
      let currentPos = {
        x: this.ratioLength,
        y: this.ratioLength,
      };

      for (const i in this.componentConfig.images) {
        const imageData = this.componentConfig.images[i];
        const image = new window.Image();
        image.src = getGameAssets(this.gameId, imageData.path);
        this.images.push(image);

        let draggable = true;
        if (imageData.draggable === false) draggable = false;

        const position = this.getPosition(imageData, currentPos).position;
        currentPos = this.getPosition(imageData, currentPos).newPos;

        const config = {
          image: this.images[i],
          width: imageData.ratio.width * this.ratioLength,
          height: imageData.ratio.height * this.ratioLength,
          draggable,
          x: position.x,
          y: position.y,
          index: i,
          rotation: 0,
        };
        this.configImage.push(config);
      }
    },
    getPosition(imageData, currentPos) {
      const position = {},
        newPos = {};
      if (imageData.presetPosition) {
        position.x = this.ratioLength * imageData.presetPosition.x;
        position.y = this.ratioLength * imageData.presetPosition.y;
      } else {
        position.x = currentPos.x;
        position.y = currentPos.y;
        newPos.x =
          currentPos.x + (imageData.ratio.width + 1) * this.ratioLength;
        newPos.y = currentPos.y;
      }
      return {
        position,
        newPos,
      };
    },
    handleDragmove(e) {
      const id = e.target.attrs.index;
      this.configImage[id].x = e.target.x();
      this.configImage[id].y = e.target.y();
      this.keepInBound(e);
      if (this.componentConfig.images[id].rotatable) {
        if (this.configRotationPanel === null) {
          this.drawPanel();
        }
        this.movePanel(this.configImage[id]);
        this.rotatingImageID = e.target.attrs.index;
      }
    },
    drawPanel() {
      this.configRotationPanel = {
        width: this.ratioLength * 2,
        height: this.ratioLength,
        fill: "#8fb0e6",
        cornerRadius: this.ratioLength * 0.5,
      };

      const arrowImage = new window.Image();
      arrowImage.src = getSystemAssets("backArrow.png", "icon");
      const flip = [1, -1],
        offset = [0, this.ratioLength * 0.8];
      for (let i = 0; i < 2; ++i) {
        const arrow = {
          width: this.ratioLength * 0.8,
          height: this.ratioLength * 0.8,
          image: arrowImage,
          scaleX: flip[i],
          offsetX: offset[i],
          index: i,
        };
        this.configArrows.push(arrow);
      }
    },
    movePanel(image) {
      this.configRotationPanel.x = image.x;

      if (image.rotation % 180 === 0) {
        if (image.y + image.height + this.ratioLength > this.gameHeight)
          this.configRotationPanel.y = image.y - this.ratioLength;
        else this.configRotationPanel.y = image.y + image.height;
      } else {
        if (image.y + image.width + this.ratioLength > this.gameHeight)
          this.configRotationPanel.y = image.y - this.ratioLength;
        else this.configRotationPanel.y = image.y + image.width;
      }

      for (let i = 0; i < 2; ++i) {
        this.configArrows[i].x =
          this.configRotationPanel.x + this.ratioLength * (i + 0.1);
        this.configArrows[i].y =
          this.configRotationPanel.y + this.ratioLength * 0.1;
      }
    },
    keepInBound(e) {
      const target = e.target;
      const width = target.width();
      const height = target.height();

      // ? x 摨扳?
      const newX = Math.max(0, Math.min(target.x(), this.gameWidth - width));
      target.x(newX);

      // ? y 摨扳?
      const newY = Math.max(0, Math.min(target.y(), this.gameHeight - height));
      target.y(newY);

      // ?湔 configImage 銝剔?雿蔭
      const id = target.attrs.index;
      this.configImage[id].x = newX;
      this.configImage[id].y = newY;
    },
    handleDragend(e) {
      const id = e.target.attrs.index;
      if (
        this.componentConfig.images[id].snapToGrid &&
        this.componentConfig.backgroundType === "grid"
      )
        this.snapToGrid(e);
    },
    snapToGrid(e) {
      const id = e.target.attrs.index;
      const snapTo = {};
      let distance = 999;
      for (const i in this.gridPos.x) {
        if (Math.abs(e.target.x() - this.gridPos.x[i]) < distance) {
          distance = Math.abs(e.target.x() - this.gridPos.x[i]);
          snapTo.x = this.gridPos.x[i];
        }
      }
      distance = 999;
      for (const i in this.gridPos.y) {
        if (Math.abs(e.target.y() - this.gridPos.y[i]) < distance) {
          distance = Math.abs(e.target.y() - this.gridPos.y[i]);
          snapTo.y = this.gridPos.y[i];
        }
      }
      e.target.x(snapTo.x);
      e.target.y(snapTo.y);
      this.configImage[id].x = snapTo.x;
      this.configImage[id].y = snapTo.y;
      this.movePanel(this.configImage[id]);
    },
    rotateImage(e) {
      const id = this.rotatingImageID;
      if (e.target.attrs.index === 0) this.configImage[id].rotation -= 90;
      else this.configImage[id].rotation += 90;
      this.movePanel(this.configImage[id]);

      switch (this.configImage[id].rotation % 360) {
        case 0:
          this.configImage[id].offsetX = 0;
          this.configImage[id].offsetY = 0;
          break;
        case 90:
        case -270:
          this.configImage[id].offsetX = 0;
          this.configImage[id].offsetY = this.configImage[id].height;
          break;
        case 180:
        case -180:
          this.configImage[id].offsetX = this.configImage[id].width;
          this.configImage[id].offsetY = this.configImage[id].height;
          break;
        case 270:
        case -90:
          this.configImage[id].offsetX = this.configImage[id].width;
          this.configImage[id].offsetY = 0;
          break;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.gameContainer {
  width: 100%;
  height: 100%;
}
</style>



