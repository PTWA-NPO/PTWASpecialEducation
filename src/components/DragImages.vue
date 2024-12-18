<template>
  <div ref="container">
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect :config="configBG" />
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
      configImage: [],
      images: [],
    };
  },

  mounted() {
    this.initializeScene();
    this.drawImages();
  },

  methods: {
    initializeScene() {
      this.gameWidth = this.$refs.container.clientWidth;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameWidth;
      this.configBG.width = this.gameWidth;
      this.configBG.height = this.gameWidth;
      if (this.Data.background) this.configBG.fill = this.Data.background;
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
      e.target.y(
        Math.min(e.target.y(), this.gameWidth - e.target.attrs.height)
      );
    },
  },
};
</script>
