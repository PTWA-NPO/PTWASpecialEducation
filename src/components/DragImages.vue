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
          @dragmove="keepInBound"
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
    </v-stage>
  </div>
</template>

<script>
import { getGameAssets } from "@/utilitys/get_assets.js";
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
    };
  },

  mounted() {
    this.initializeScene();
    this.drawBackground();
    this.drawImages();
  },

  methods: {
    initializeScene() {
      this.gameWidth = this.$refs.container.clientWidth;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameWidth;
      this.configBG.width = this.gameWidth;
      this.configBG.height = this.gameWidth;
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
      for (let i = 0; i <= this.Data.background; ++i)
        this.gridPos.x.push((i * this.gameWidth) / this.Data.background);
      for (let i = 0; i <= this.Data.background; ++i)
        this.gridPos.y.push((i * this.gameWidth) / this.Data.background);
    },
    drawGrid() {
      this.configBG = [];
      for (let i = 1; i < this.Data.background; ++i) {
        this.configBG.push([this.gridPos.x[i], 0, this.gridPos.x[i], this.gameWidth]);
      }
      for (let i = 1; i < this.Data.background; ++i) {
        this.configBG.push([0, this.gridPos.y[i], this.gameWidth, this.gridPos.y[i]]);
      }
    },
    drawImages() {
      if (this.Data.backgroundType == "grid")
        this.ratioLength = this.gameWidth / this.Data.background;
      else this.ratioLength = this.gameWidth / 11;
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
        };
        this.configImage.push(config);
      }
    },
    getPosition(imageData, currentPos) {
      let position = {},
        newPos = {};
      if (imageData.presetPosition) {
        position.x = this.gridPos.x[imageData.presetPosition.x];
        position.y = this.gridPos.y[imageData.presetPosition.y];
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
    keepInBound(e) {
      e.target.x(Math.max(e.target.x(), 0));
      e.target.x(Math.min(e.target.x(), this.gameWidth - e.target.attrs.width));
      e.target.y(Math.max(e.target.y(), 0));
      e.target.y(Math.min(e.target.y(), this.gameWidth - e.target.attrs.height));
    },
    handleDragend(e) {
      if (this.Data.images[e.target.index].snapToGrid) this.snapToGrid(e);
    },
    snapToGrid(e) {
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
    },
  },
};
</script>
