<template>
  <v-image v-if="config.open && cat" :config="configBinCat" />
  <v-image v-else-if="config.open && !cat" :config="configBinOpen" />
  <v-image v-else :config="configBin" />

  <v-image v-if="cat && config.open" :config="configFace" />
</template>

<script>
import { getSystemAssets } from "@/utilitys/get_assets.js";
import * as canvasTools from "@/utilitys/canvasTools.js";
import { defineAsyncComponent } from "vue";
export default {
  components: {},

  props: {
    config: {
      type: Object,
      required: true,
    },
  },

  emits: ["getBinPos"],
  data() {
    return {
      configBin: {},
      configBinOpen: {},
      configBinCat: {},
      configFace: {
        //visible: false,
      },
      cat: true,
      images: {},
    };
  },

  beforeMount() {
    this.setImages();
    this.initializeScene();
  },

  mounted() {
    this.$emit("getBinPos", canvasTools.center(this.configBin));
  },

  beforeUpdate() {
    if (Math.floor(Math.random() * 10) == 0) {
      this.cat = true;
    } else this.cat = false;
  },

  methods: {
    setImages() {
      this.images.bin = new window.Image();
      this.images.bin.src = getSystemAssets("bin.png", "icon");
      this.images.binOpen = new window.Image();
      this.images.binOpen.src = getSystemAssets("binOpen.png", "icon");
      this.images.binCat = new window.Image();
      this.images.binCat.src = getSystemAssets("binCat.png", "icon");
      this.images.catFace = new window.Image();
      this.images.catFace.src = getSystemAssets("catFace.png", "icon");
    },
    initializeScene() {
      this.configBin.x = this.config.x;
      this.configBin.y = this.config.y;
      this.configBin.width = this.config.width;
      this.configBin.height = this.config.width;
      this.configBin.image = this.images.bin;

      this.configBinOpen.x = this.config.x;
      this.configBinOpen.y = this.config.y;
      this.configBinOpen.width = this.config.width;
      this.configBinOpen.height = this.config.width;
      this.configBinOpen.image = this.images.binOpen;

      this.configBinCat.x = this.config.x;
      this.configBinCat.y = this.config.y;
      this.configBinCat.width = this.config.width;
      this.configBinCat.height = this.config.width;
      this.configBinCat.image = this.images.binCat;

      this.faceOffset = {
        x: this.config.width * 0.545,
        y: this.config.width * 0.26,
      };
      this.configFace.x = canvasTools.offset(this.config, this.faceOffset).x;
      this.configFace.y = canvasTools.offset(this.config, this.faceOffset).y;
      this.configFace.width = this.config.width * 0.1;
      this.configFace.height = this.config.width * 0.05;
      this.configFace.image = this.images.catFace;
    },
  },
};
</script>
