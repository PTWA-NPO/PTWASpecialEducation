<template>
  <div ref="container">
    <h2>{{ GameData.Question }}</h2>
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect :config="configBG" />
      </v-layer>
      <v-layer>
        <v-circle :config="configRing"></v-circle>
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
        fill: "#D09F57",
        stroke: "#D09F57",
      },
      configRing: {
        stroke: "black",
        strokeWidth: 5,
        draggable: true,
      },
      ringRadius: [],
    };
  },
  mounted() {
    this.initializeScene();
    this.setRingRadius();
    this.drawRing();
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
    setRingRadius() {
      this.ringRadius[this.findLargestRadius()] = this.gameWidth / 5;

      let ratio =
        this.GameData.Radius[1 - this.findLargestRadius()] /
        this.GameData.Radius[this.findLargestRadius()];
      this.ringRadius[1 - this.findLargestRadius()] =
        this.ringRadius[this.findLargestRadius()] * ratio;
    },
    findLargestRadius() {
      if (this.GameData.Radius[0] < this.GameData.Radius[1]) {
        return 1;
      } else {
        return 0;
      }
    },
    drawRing() {
      this.configRing.x = (this.gameWidth / 4) * 3;
      this.configRing.y = this.gameHeight / 2 - this.gameWidth / 40;
      this.configRing.radius = this.ringRadius[0];
    },
  },
};
</script>
