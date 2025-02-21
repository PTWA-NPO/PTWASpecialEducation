<template>
  <div ref="container">
    <v-stage :config="configKonva">
      <v-layer>
        <v-image
          v-for="(fill, index) in configFill"
          :key="index"
          :config="fill"
        ></v-image>
        <v-image
          v-for="(frame, index) in configFrame"
          :key="index"
          :config="frame"
        ></v-image>
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

  emits: ["play-effect", "add-record", "next-question"],

  data() {
    return {
      configKonva: {},
      configFrame: [],
      configFill: [],
      mapOfRows: [],
    };
  },

  mounted() {
    this.initializeScene();
  },

  methods: {
    initializeScene() {
      this.ratio = this.setRatio();
      this.setCanvas();
      this.setMap();
      this.draw();
    },
    setRatio() {
      let row = Math.floor(Math.pow(this.Data.frame, 0.5));
      let column = Math.ceil(this.Data.frame / row);

      return {
        row: row,
        column: column,
      };
    },
    setCanvas() {
      if (
        this.$refs.container.clientWidth * this.ratio.row <=
          this.$refs.container.clientHeight * this.ratio.column ||
        this.$refs.container.clientHeight == 0
      ) {
        this.gameWidth = this.$refs.container.clientWidth;
        this.gameHeight = (this.gameWidth * this.ratio.row) / this.ratio.column;
      } else {
        this.gameHeight = this.$refs.container.clientHeight;
        this.gameWidth = (this.gameHeight / this.ratio.row) * this.ratio.column;
      }
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameHeight;
      this.ratioLength = this.gameWidth / this.ratio.column;
    },
    setMap() {
      let rowWithLessElements = this.ratio.column - (this.Data.frame % this.ratio.column);
      if (rowWithLessElements == this.ratio.column) rowWithLessElements = 0;
      for (let i = 0; i < this.ratio.row; ++i) {
        if (i < rowWithLessElements) this.mapOfRows.push(this.ratio.column - 1);
        else this.mapOfRows.push(this.ratio.column);
      }
    },
    draw() {
      const frameImage = new window.Image();
      frameImage.src = getGameAssets(this.ID, this.Data.frameImage);
      const fillImage = new window.Image();
      fillImage.src = getGameAssets(this.ID, this.Data.fillImage);
      for (let i in this.mapOfRows) {
        for (let j = 0; j < this.mapOfRows[i]; ++j) {
          let frame = {
            width: this.ratioLength,
            height: this.ratioLength,
            x: this.ratioLength * j,
            y: this.ratioLength * i,
            image: frameImage,
          };
          this.configFrame.push(frame);

          let fill = {
            width: this.ratioLength,
            height: this.ratioLength,
            x: this.ratioLength * j,
            y: this.ratioLength * i,
            image: fillImage,
          };
          this.configFill.push(fill);
        }
      }
    },
  },
};
</script>
