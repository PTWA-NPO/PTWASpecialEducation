<template>
  <div ref="container">
    <h2>{{ GameData.Question }}</h2>
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect :config="configBG" />
        <v-rect v-for="(frame, index) in configFrames" :key="index" :config="frame" />
      </v-layer>
      <v-layer> </v-layer>
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
    GameData: {
      type: Object,
      required: true,
    },
    GameConfig: {
      type: Object,
      required: true,
    },
  },
  emits: ["play-effect", "add-record", "next-question"],
  data() {
    return {
      configKonva: {},
      configBG: {
        x: 0,
        y: 0,
        fill: "#8e6d3c",
        stroke: "#8e6d3c",
      },
      configFrames: [
        {
          fill: "#c8d0d6",
          strokeEnabled: false,
        },
        {
          fill: "#9D9FAB",
          strokeEnabled: false,
        },
      ],
    };
  },
  mounted() {
    this.initializeScene();
    this.drawFrames();
  },

  methods: {
    initializeScene() {
      this.gameWidth = this.$refs.container.clientWidth;
      this.gameHeight = this.gameWidth / 2;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameHeight;
      this.configBG.width = this.gameWidth / 2;
      this.configBG.height = this.gameHeight;
    },
    drawFrames() {
      this.configFrames[0].x = this.gameWidth / 2;
      this.configFrames[0].y = 0;
      this.configFrames[0].width = this.gameWidth / 2;
      this.configFrames[0].height = this.gameHeight / 2;

      this.configFrames[1].x = this.gameWidth / 2;
      this.configFrames[1].y = this.gameHeight / 2;
      this.configFrames[1].width = this.gameWidth / 2;
      this.configFrames[1].height = this.gameHeight / 2;
    },
    update() {},
  },
};
</script>
