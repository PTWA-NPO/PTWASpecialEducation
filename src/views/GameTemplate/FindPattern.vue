<template>
  <div ref="container">
    <h2>{{ GameData.Question }}</h2>
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect v-if="GameData.AnswerType == 'Drag'" :config="configDragBG"></v-rect>
      </v-layer>
      <v-layer>
        <v-image v-for="(block, index) in configBlocks" :key="index" :config="block" />
      </v-layer>
      <v-layer v-if="GameData.AnswerType == 'Drag'">
        <v-image
          v-for="(block, index) in configDraggables"
          :key="index"
          :config="block"
          @dragend="handleDragend"
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
    GameData: {
      type: Object,
      required: true,
    },
    GameConfig: {
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
      configDragBG: {},
      configBlocks: [],
      configDraggables: [],
      answers: [],
    };
  },

  mounted() {
    this.initializeScene();
  },

  methods: {
    initializeScene() {
      this.tableSize = {
        width: this.GameData.Map[0].length,
        height: this.GameData.Map.length,
      };
      let gameRatio;
      switch (this.GameData.AnswerType) {
        case "Drag":
          gameRatio = this.tableSize.width / (this.tableSize.height + 1.5);
          break;
        case "Fill":
          gameRatio = this.tableSize.width / this.tableSize.height;
          break;
      }

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
      this.blockWidth = this.gameWidth / this.tableSize.width;

      switch (this.GameData.AnswerType) {
        case "Drag":
          this.drawDragBG();
          this.drawDragMap();
          this.drawDraggables();
          break;
        case "Fill":
          this.drawFillMap();
          break;
      }
    },
    drawDragBG() {
      this.configDragBG = {
        x: 0,
        y: this.blockWidth * this.tableSize.height,
        width: this.gameWidth,
        height: this.blockWidth * 1.5,
        fill: "gray",
        stroke: "gray",
        cornerRadius: this.blockWidth * 0.5,
      };
    },
    drawDragMap() {
      this.images = [];
      for (let i in this.GameData.Images) {
        let image = new window.Image();
        image.src = getGameAssets(this.ID, this.GameData.Images[i]);
        this.images.push(image);
      }

      for (let i = 0; i < this.tableSize.width; ++i) {
        for (let j = 0; j < this.tableSize.height; ++j) {
          let block = {
            x: this.blockWidth * i,
            y: this.blockWidth * j,
            height: this.blockWidth,
            width: this.blockWidth,
            image: this.images[this.GameData.Map[j][i]],
            visible: !this.isBlankSpace(i, j),
            answerIndex: this.isBlankSpace(i, j),
          };
          this.configBlocks.push(block);
          if (!block.visible) this.answers.push(null);
        }
      }
    },
    drawDraggables() {
      for (let i in this.images) {
        let block = {
          x: this.blockWidth * (Number(i) * 1.25 + 0.25),
          y: this.blockWidth * (this.tableSize.height + 0.25),
          height: this.blockWidth,
          width: this.blockWidth,
          image: this.images[i],
          draggable: true,
          index: i,
        };
        this.configDraggables.push(block);
      }
    },
    drawFillMap() {},
    isBlankSpace(x, y) {
      for (let i in this.GameData.BlankSpace) {
        if (this.GameData.BlankSpace[i][0] == x && this.GameData.BlankSpace[i][1] == y)
          return i;
      }
      return null;
    },
    handleDragend(e) {
      let id = e.target.attrs.index;
      if (id < this.images.length) {
        for (let block in this.configBlocks) {
          if (
            this.isSlotAvailable(block) &&
            canvasTools.distance(e.target.position(), this.configBlocks[block]) <
              this.blockWidth * 0.25
          ) {
            this.newDraggable(block, id);
            this.answers[this.configBlocks[block].answerIndex] = id;
          }
        }
        this.snapBack(e);
      } else {
        if (
          canvasTools.distance(e.target.position(), this.configDraggables[id]) <
          this.blockWidth * 0.5
        ) {
          this.snapBack(e);
        } else {
          this.answers[this.configDraggables[id].answerIndex] = null;
          this.configDraggables.splice(id, 1);
        }
      }
      console.log(this.answers);
    },
    isSlotAvailable(block) {
      if (this.configBlocks[block].answerIndex) {
        if (this.answers[this.configBlocks[block].answerIndex] == null) return true;
      } else return false;
    },
    snapBack(e) {
      let id = e.target.attrs.index;
      e.target.x(this.configDraggables[id].x);
      e.target.y(this.configDraggables[id].y);
    },
    newDraggable(slot, imageID) {
      let block = {
        x: this.configBlocks[slot].x,
        y: this.configBlocks[slot].y,
        height: this.blockWidth,
        width: this.blockWidth,
        image: this.images[imageID],
        draggable: true,
        index: this.configDraggables.length,
        answerIndex: this.configBlocks[slot].answerIndex,
      };
      this.configDraggables.push(block);
    },
  },
};
</script>
