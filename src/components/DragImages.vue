<template>
  <div ref="container">
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect v-if="Data.backgroundType == 'color'" :config="configBG" />
        <v-image v-if="Data.backgroundType == 'image'" :config="configBG" />
      </v-layer>

      <v-layer>
        <v-image
          v-for="(image, index) in configImage"
          :key="index"
          :config="image"
          @dragmove="handleDragmove"
          @dragend="handleDragend"
        />
      </v-layer>
      <v-layer v-if="Data.backgroundType == 'grid'">
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
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { getGameAssets } from "@/utilitys/get_assets.js";
import { getSystemAssets } from "@/utilitys/get_assets.js";
import * as canvasTools from "@/utilitys/canvasTools.js";
import { defineAsyncComponent } from "vue";
export default {
  components: {},
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
      configKonva: {},
      configBG: {
        x: 0,
        y: 0,
        strokeEnabled: false,
      },
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
        this.$refs.container.clientWidth * this.Data.backgroundRatio.height <=
          this.$refs.container.clientHeight * this.Data.backgroundRatio.width ||
        this.$refs.container.clientHeight == 0
      ) {
        this.gameWidth = this.$refs.container.clientWidth;
        this.gameHeight =
          (this.gameWidth * this.Data.backgroundRatio.height) /
          this.Data.backgroundRatio.width;
      } else {
        this.gameHeight = this.$refs.container.clientHeight;
        this.gameWidth =
          (this.gameHeight * this.Data.backgroundRatio.width) /
          this.Data.backgroundRatio.height;
      }

      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameHeight;
      this.configBG.width = this.gameWidth;
      this.configBG.height = this.gameHeight;
    },
    drawBackground() {
      switch (this.Data.backgroundType) {
        case "grid":
          this.setGrid();
          this.drawGrid();
          break;
        case "color":
          this.configBG.fill = this.Data.background;
          break;
        case "image":
          let image = new window.Image();
          image.src = getGameAssets(this.ID, this.Data.background);
          this.configBG.image = image;
          break;
      }
    },
    setGrid() {
      for (let i = 0; i <= this.Data.backgroundRatio.width; ++i)
        this.gridPos.x.push((i * this.gameWidth) / this.Data.backgroundRatio.width);
      for (let i = 0; i <= this.Data.backgroundRatio.height; ++i)
        this.gridPos.y.push((i * this.gameHeight) / this.Data.backgroundRatio.height);
    },
    drawGrid() {
      this.configBG = [];
      for (let i = 1; i < this.Data.backgroundRatio.width; ++i) {
        this.configBG.push([this.gridPos.x[i], 0, this.gridPos.x[i], this.gameHeight]);
      }
      for (let i = 1; i < this.Data.backgroundRatio.height; ++i) {
        this.configBG.push([0, this.gridPos.y[i], this.gameWidth, this.gridPos.y[i]]);
      }
    },
    drawImages() {
      this.ratioLength = this.gameWidth / this.Data.backgroundRatio.width;
      let currentPos = {
        x: this.ratioLength,
        y: this.ratioLength,
      };

      for (let i in this.Data.images) {
        let imageData = this.Data.images[i];
        let image = new window.Image();
        image.src = getGameAssets(this.ID, imageData.path);
        this.images.push(image);

        let draggable = true;
        if (imageData.draggable == false) draggable = false;

        let position = this.getPosition(imageData, currentPos).position;
        currentPos = this.getPosition(imageData, currentPos).newPos;

        let config = {
          image: this.images[i],
          width: imageData.ratio.width * this.ratioLength,
          height: imageData.ratio.height * this.ratioLength,
          draggable: draggable,
          x: position.x,
          y: position.y,
          index: i,
          rotation: 0,
        };
        this.configImage.push(config);
      }
    },
    getPosition(imageData, currentPos) {
      let position = {},
        newPos = {};
      if (imageData.presetPosition) {
        position.x = this.ratioLength * imageData.presetPosition.x;
        position.y = this.ratioLength * imageData.presetPosition.y;
      } else {
        position.x = currentPos.x;
        position.y = currentPos.y;
        newPos.x = currentPos.x + (imageData.ratio.width + 1) * this.ratioLength;
        newPos.y = currentPos.y;
      }
      return {
        position: position,
        newPos: newPos,
      };
    },
    handleDragmove(e) {
      let id = e.target.attrs.index;
      this.configImage[id].x = e.target.x();
      this.configImage[id].y = e.target.y();
      this.keepInBound(e);
      if (this.Data.images[id].rotatable) {
        if (this.configRotationPanel == null) {
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

      let arrowImage = new window.Image();
      arrowImage.src = getSystemAssets("backArrow.png", "icon");
      let flip = [1, -1],
        offset = [0, this.ratioLength * 0.8];
      for (let i = 0; i < 2; ++i) {
        let arrow = {
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

      if (image.rotation % 180 == 0) {
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
        this.configArrows[i].y = this.configRotationPanel.y + this.ratioLength * 0.1;
      }
    },
    keepInBound(e) {
      e.target.x(Math.max(e.target.x(), 0));
      e.target.x(Math.min(e.target.x(), this.gameWidth - e.target.attrs.width));
      e.target.y(Math.max(e.target.y(), 0));
      e.target.y(Math.min(e.target.y(), this.gameWidth - e.target.attrs.height));
    },
    handleDragend(e) {
      let id = e.target.attrs.index;
      if (this.Data.images[id].snapToGrid && this.Data.backgroundType == "grid")
        this.snapToGrid(e);
    },
    snapToGrid(e) {
      let id = e.target.attrs.index;
      let snapTo = {},
        distance = 999;
      for (let i in this.gridPos.x) {
        if (Math.abs(e.target.x() - this.gridPos.x[i]) < distance) {
          distance = Math.abs(e.target.x() - this.gridPos.x[i]);
          snapTo.x = this.gridPos.x[i];
        }
      }
      distance = 999;
      for (let i in this.gridPos.y) {
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
      this.configImage[this.rotatingImageID].rotation += 90;
      this.movePanel(this.configImage[this.rotatingImageID]);
    },
  },
};
</script>
