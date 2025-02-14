<template>
  <div ref="container">
    <h2>{{ GameData.Question }}</h2>
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect :config="configBG"></v-rect>
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
    };
  },

  mounted() {
    this.initializeScene();
  },

  methods: {
    initializeScene() {
      let gameRatio;
      if (this.GameData.AnswerType == "Drag")
        gameRatio = this.GameData.Map[0].length / (this.GameData.Map.length + 1.5);
      else gameRatio = this.GameData.Map[0].length / this.GameData.Map.length;

      if (
        this.$refs.container.clientWidth / gameRatio <=
          this.$refs.container.clientHeight ||
        this.$refs.container.clientHeight <= this.$refs.container.clientWidth * 0.1
      ) {
        this.gameWidth = this.$refs.container.clientWidth;
        this.gameHeight = this.gameWidth / gameRatio;
      } else {
        this.gameHeight = this.$refs.container.clientHeight;
        this.gameWidth = this.gameHeight * gameRatio;
      }
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameHeight;
      this.configBG.width = this.gameWidth;
      this.configBG.height = this.gameHeight;
    },
    update() {},
  },
};
</script>
