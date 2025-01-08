<template>
  <div ref="container">
    <h2>{{ GameData.Question }}</h2>
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect :config="configBG"></v-rect>
      </v-layer>
      <v-layer>
        <v-rect :config="configFrame1"> </v-rect>
        <v-rect :config="configFrame2"> </v-rect>
        <v-rect :config="configFrame3"> </v-rect>
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
        fill: "gray",
        stroke: "gray",
      },
      configFrame1: {},
      configFrame2: {},
      configFrame3: {},
    };
  },
  mounted() {
    this.initializeScene();
    this.drawFrame();
  },

  methods: {
    initializeScene() {
      this.gameWidth = this.$refs.container.clientWidth;
      this.gameHeight = this.gameWidth / 2;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameHeight;
      this.configBG.width = this.gameHeight;
      this.configBG.height = this.gameHeight;
    },
    drawFrame() {
      this.configFrame1.x = this.gameWidth / 2;
      this.configFrame2.x = this.gameWidth / 2;
      this.configFrame3.x = this.gameWidth / 2;
      this.configFrame1.y = 0;
      this.configFrame2.y = (this.gameHeight / 7) * 3;
      this.configFrame3.y = (this.gameHeight / 7) * 6;
      this.configFrame1.width = this.gameWidth / 2;
      this.configFrame2.width = this.gameWidth / 2;
      this.configFrame3.width = this.gameWidth / 2;
      this.configFrame1.height = (this.gameHeight / 7) * 3;
      this.configFrame2.height = (this.gameHeight / 7) * 3;
      this.configFrame3.height = this.gameHeight / 7;
      this.configFrame1.fill = "brown";
      this.configFrame2.fill = "darkblue";
      this.configFrame3.fill = "darkgreen";
    },
    update() {},
  },
};
</script>
