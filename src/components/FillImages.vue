<template>
  <div ref="container">
    <v-stage :config="configKonva">
      <v-layer>
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
    };
  },

  mounted() {
    this.initializeScene();
  },

  methods: {
    initializeScene() {
      this.ratio = this.setRatio();
      this.setCanvas();
    },
    setRatio() {
      let row = Math.floor(Math.pow(this.Data.frame, 0.5));
      let column = Math.ceil(this.Data.frame / row);
      this.ratioLength = this.gameWidth / column;
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
    },
  },
};
</script>
