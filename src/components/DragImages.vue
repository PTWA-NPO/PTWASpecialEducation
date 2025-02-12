<template>
  <div ref="container">
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect v-if="Data.backgroundType == 'color'" :config="configBG" />
        <v-image v-if="Data.backgroundType == 'image'" :config="configBG" />
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
        <v-image
          v-for="(image, index) in configImage"
          :key="index"
          :config="image"
          @dragmove="keepInBound"
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
      this.ratioLength = this.gameWidth / 11;
      let currentPos = {
        x: this.ratioLength,
        y: this.ratioLength,
      };

      for (let i in this.Data.images) {
        let image = new window.Image();
        image.src = getGameAssets(this.ID, this.Data.images[i].path);
        this.images.push(image);
        let config = {
          image: this.images[i],
          width: this.Data.images[i].ratio.width * this.ratioLength,
          height: this.Data.images[i].ratio.height * this.ratioLength,
          draggable: true,
          x: currentPos.x,
          y: currentPos.y,
        };
        this.configImage.push(config);
        currentPos.x += config.width;
        currentPos.x += this.ratioLength;
      }
    },
    keepInBound(e) {
      e.target.x(Math.max(e.target.x(), 0));
      e.target.x(Math.min(e.target.x(), this.gameWidth - e.target.attrs.width));
      e.target.y(Math.max(e.target.y(), 0));
      e.target.y(Math.min(e.target.y(), this.gameWidth - e.target.attrs.height));
    },
  },
};
</script>
