<template>
  <div ref="container">
    <v-stage :config="configKonva">
      <v-layer>
        <v-line
          v-for="(pointSet, index) in configGrid"
          :key="index"
          :points="pointSet"
          :stroke="'black'"
        />
        <v-image :config="configImage" @dragmove="keepInBound" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { getGameAssets } from "@/lib/get-assets.js";
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
      configImage: {
        draggable: true,
      },
      ratio: {
        width: 15,
        height: 15,
      },
      gridPos: {
        x: [],
        y: [],
      },
      configGrid: [],
    };
  },

  mounted() {
    this.initializeScene();
    this.setGrid();
    this.drawGrid();
    this.drawImage();
  },

  methods: {
    initializeScene() {
      this.gameWidth = this.$refs.container.clientWidth;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameWidth;
      this.gridWidth = this.gameWidth / this.ratio.width;
    },
    setGrid() {
      for (let i = 0; i <= this.ratio.width; ++i)
        this.gridPos.x.push((i * this.configKonva.width) / this.ratio.width);
      for (let i = 0; i <= this.ratio.height; ++i)
        this.gridPos.y.push((i * this.configKonva.height) / this.ratio.height);
    },
    drawGrid() {
      for (let i = 1; i < this.ratio.width; ++i) {
        this.configGrid.push([
          this.gridPos.x[i],
          0,
          this.gridPos.x[i],
          this.configKonva.height,
        ]);
      }
      for (let i = 1; i < this.ratio.height; ++i) {
        this.configGrid.push([
          0,
          this.gridPos.y[i],
          this.configKonva.width,
          this.gridPos.y[i],
        ]);
      }
    },
    drawImage() {
      const image = new window.Image();
      image.src = getGameAssets(this.gameId, this.componentConfig.image);
      this.configImage.image = image;
      this.configImage.x = this.gridWidth;
      this.configImage.y = this.gridWidth;
      this.configImage.width =
        this.gridWidth * this.componentConfig.imageRatio[0];
      this.configImage.height =
        this.gridWidth * this.componentConfig.imageRatio[1];
    },
    keepInBound(e) {
      e.target.x(Math.max(e.target.x(), 0));
      e.target.x(
        Math.min(e.target.x(), this.gameWidth - this.configImage.width)
      );
      e.target.y(Math.max(e.target.y(), 0));
      e.target.y(
        Math.min(e.target.y(), this.gameWidth - this.configImage.height)
      );
    },
  },
};
</script>



