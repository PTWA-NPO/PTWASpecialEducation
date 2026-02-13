<template>
  <div class="level-container">
    <div class="level-2-question">
      <h2>{{ gameData.Question }}</h2>
    </div>
    <div ref="container" class="v-stage-container">
      <v-stage :config="stageConfig">
        <v-layer>
          <v-rect :config="dragAreaConfig" />
        </v-layer>

        <v-layer>
          <v-text v-for="(label, i) in rowLabels" :key="i" :config="label" />
        </v-layer>

        <v-layer>
          <v-image v-for="(cell, i) in cells" :key="i" :config="cell" />
        </v-layer>

        <v-layer :key="draggableKey">
          <v-image
            v-for="(item, i) in draggables"
            :key="i"
            :config="item"
            @dragend="onDragEnd"
          />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<script>
import { getGameAssets } from "@/utilitys/get_assets.js";
import * as canvasTools from "@/utilitys/canvasTools.js";

export default {
  name: "MA3132Level2",
  props: {
    gameData: {
      type: Object,
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    },
    submitTick: {
      type: Number,
      default: 0,
    },
  },
  emits: ["play-effect", "next-question"],
  data() {
    return {
      stageConfig: { width: 0, height: 0 },
      dragAreaConfig: {},
      cells: [],
      rowLabels: [],
      draggables: [],
      answers: [],
      draggableKey: 0,
      blockSize: 0,
      tableSize: { width: 0, height: 0 },
      images: [],
    };
  },
  watch: {
    submitTick() {
      this.submitAnswer();
    },
  },
  mounted() {
    this.$nextTick(this.initScene);
    window.addEventListener("resize", this.initScene);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.initScene);
  },
  methods: {
    initScene() {
      this.tableSize = {
        width: this.gameData.Map[0].length,
        height: this.gameData.Map.length,
      };
      this.calculateBlockSize();
      this.buildBackground();
      this.buildCells();
      this.setupDraggables();
    },

    calculateBlockSize() {
      const { clientWidth: w, clientHeight: h } = this.$refs.container;
      const byWidth = w / (this.tableSize.width + 2);
      const byHeight = h / (this.tableSize.height + 1);
      this.blockSize = Math.min(byWidth, byHeight);
      this.stageConfig.width = w;
      this.stageConfig.height = h;
    },
    buildBackground() {
      this.dragAreaConfig = {
        x: 0,
        y: this.blockSize * this.tableSize.height,
        width: this.stageConfig.width,
        height: this.blockSize,
        fill: "gray",
        stroke: "gray",
        cornerRadius: this.blockSize * 0.2,
      };
    },
    buildCells() {
      const loadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = getGameAssets(this.gameId, src);
        });
      };

      Promise.all(this.gameData.Images.map(loadImage))
        .then((loadedImages) => {
          this.images = loadedImages;

          this.rowLabels = Array.from(
            { length: this.tableSize.height },
            (_, r) => ({
              x: 0,
              y: this.blockSize * r + this.blockSize * 0.25,
              text: `第${r + 1}行`,
              fontSize: this.blockSize * 0.4,
              fontFamily: "YuanQuan, sans-serif",
            })
          );

          this.cells = [];
          this.answers = [];
          this.gameData.Map.forEach((row, r) => {
            row.forEach((val, c) => {
              const isBlank = this.gameData.BlankSpace.some(
                (b) => b.x === c && b.y === r
              );
              this.cells.push({
                x: this.blockSize * (c + 1.5),
                y: this.blockSize * r,
                width: this.blockSize,
                height: this.blockSize,
                image: this.images[val],
                visible: !isBlank,
                slotIndex: isBlank ? this.answers.length : null,
              });
              if (isBlank) this.answers.push(null);
            });
          });

          this.setupDraggables();
        })
        .catch((error) => {
          console.error("Error loading images:", error);
        });
    },

    setupDraggables() {
      // Always reset and build your palette items
      this.draggables = this.gameData.BlankSpace.map(({ x, y }, i) => {
        const idx = this.gameData.Map[y][x];
        return {
          id: `palette-${i}`, // unique string id for palette
          imageIndex: idx,
          type: "palette", // mark as palette
          visible: true,
          x: this.blockSize * (i * 1.25),
          y: this.blockSize * this.tableSize.height,
          width: this.blockSize,
          height: this.blockSize,
          image: this.images[idx],
          draggable: true,
          slotIndex: null,
        };
      });
    },

    placeInSlot(slotIdx, imgIdx, slotCell) {
      // 1) record answer
      this.answers.splice(slotIdx, 1, imgIdx);

      // 2) hide the palette item
      const pal = this.draggables.find(
        (d) => d.type === "palette" && d.imageIndex === imgIdx
      );
      if (pal) pal.visible = false;

      // 3) add a placed draggable
      this.draggables.push({
        id: `placed-${slotIdx}`, // string id for placed item
        imageIndex: imgIdx,
        type: "placed",
        slotIndex: slotIdx,
        x: slotCell.x,
        y: slotCell.y,
        width: this.blockSize,
        height: this.blockSize,
        image: this.images[imgIdx],
        draggable: true,
      });

      // 4) force re-render
      this.draggableKey++;
    },
    submitAnswer() {
      const wrong = [];
      console.log("Current answers:", this.answers);
      console.log("BlankSpace:", this.gameData.BlankSpace);
      console.log("Map:", this.gameData.Map);

      this.gameData.BlankSpace.forEach(({ x, y }) => {
        const correctValue = this.gameData.Map[y][x];
        const cell = this.cells.find(
          (c) =>
            c.x === this.blockSize * (x + 1.5) && c.y === this.blockSize * y
        );
        const userAnswer = cell ? this.answers[cell.slotIndex] : null;
        console.log(`Checking position (${x},${y}):`, {
          userAnswer,
          correctValue,
        });
        if (userAnswer !== correctValue) {
          wrong.push(cell.slotIndex);
        }
      });

      if (!wrong.length) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.removeWrong(wrong);
      }
    },

    removeWrong(indices) {
      // 1) find all placed draggables in wrong slots and remove them
      const wrongPlaced = this.draggables.filter(
        (d) => d.type === "placed" && indices.includes(d.slotIndex)
      );
      wrongPlaced.forEach((d) => {
        // restore the corresponding palette item
        const pal = this.draggables.find(
          (p) => p.type === "palette" && p.imageIndex === d.imageIndex
        );
        if (pal) pal.visible = true;
      });

      // actually remove all the wrong placed items
      this.draggables = this.draggables.filter(
        (d) => !(d.type === "placed" && indices.includes(d.slotIndex))
      );

      // clear answers
      indices.forEach((i) => (this.answers[i] = null));

      // re-render
      this.draggableKey++;
    },

    onDragEnd(evt) {
      const idx = evt.target.index;
      const item = this.draggables[idx];
      const pos = evt.target.position();

      // 1) 放回 palette：拖到灰色區域（y 超過表格底部）
      const paletteY = this.blockSize * this.tableSize.height;
      if (item.type === "placed" && pos.y > paletteY) {
        // 清掉答案
        this.answers[item.slotIndex] = null;

        // 顯示對應的 palette
        const pal = this.draggables.find(
          (d) => d.type === "palette" && d.imageIndex === item.imageIndex
        );
        if (pal) pal.visible = true;

        // 刪掉這個 placed 物件
        this.draggables = this.draggables.filter((d) => d !== item);

        // 重新渲染
        this.draggableKey++;
        return;
      }

      // 2) 放進另一個格子：跟之前一樣
      const dropSlot = this.cells.find(
        (c) =>
          c.slotIndex !== null &&
          this.answers[c.slotIndex] === null &&
          canvasTools.distance(pos, c) < this.blockSize * 0.25
      );

      if (dropSlot) {
        if (item.type === "palette") {
          // palette → cell
          this.placeInSlot(dropSlot.slotIndex, item.imageIndex, dropSlot);
        } else if (item.type === "placed") {
          // placed → cell
          const old = item.slotIndex;
          this.answers[old] = null;
          this.answers[dropSlot.slotIndex] = item.imageIndex;
          item.slotIndex = dropSlot.slotIndex;
          item.x = dropSlot.x;
          item.y = dropSlot.y;
          this.draggableKey++;
        }
      } else {
        // 其他情況：還原原本位置
        evt.target.position({ x: item.x, y: item.y });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.level-container {
  display: flex;
  flex-direction: column;
  gap: $gap--small;
  width: 100%;
  height: 90%;
}

.level-2-question {
  display: flex;
  flex-direction: column;
  gap: $gap--small;
  height: 10%;
  h2 {
    margin: 0;
  }
}

.v-stage-container {
  flex: 1;
}
</style>
