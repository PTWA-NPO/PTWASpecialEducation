<template>
  <div ref="container">
    <h2>{{ GameData.Question }}</h2>
    <v-stage :config="configKonva">
      <v-layer>
        <v-image :config="configBG" />
      </v-layer>

      <v-layer>
        <v-image
          v-for="(board, index) in configObjects.board"
          :key="index"
          :config="board"
        />
        <v-text
          v-for="(option, index) in configObjects.option"
          :key="index"
          :config="option"
        />
        <v-image
          v-for="(mole, index) in configObjects.mole"
          :key="index"
          :config="mole"
          @pointerdown="whacked"
        />
        <v-image
          v-for="(hole, index) in configObjects.hole"
          :key="index"
          :config="hole"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { getSystemAssets } from "@/utilitys/get_assets.js";
import * as canvasTools from "@/utilitys/canvasTools.js";
import { defineAsyncComponent } from "vue";

export default {
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
      configBG: {},
      configObjects: {
        position: [],
        status: [],
        cropPercent: [],
        board: [],
        option: [],
        mole: [],
        hole: [],
      },
      images: {},
      offsets: {},

      startId: 0,
    };
  },
  mounted() {
    this.initializeScene();
    this.initializeOption();
    this.game = window.setInterval(this.update, 20);
  },

  methods: {
    initializeScene() {
      this.gameWidth = this.$refs.container.clientWidth * 0.8;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameWidth / 2;
      this.setAttributes();
      this.drawBG();
      this.spawnMole();
    },
    setAttributes() {
      this.images.bg = new window.Image();
      this.images.bg.src = getGameStaticAssets("WhackaMole", "background.png");
      this.images.board = new window.Image();
      this.images.board.src = getGameStaticAssets(
        "WhackaMole",
        "answerBoard.png"
      );
      this.images.hole = new window.Image();
      this.images.hole.src = getGameStaticAssets("WhackaMole", "hole.png");
      this.images.holeup = new window.Image();
      this.images.holeup.src = getGameStaticAssets("WhackaMole", "holeup.png");
      this.images.mole = new window.Image();
      this.images.mole.src = getGameStaticAssets("WhackaMole", "mole.png");
      this.images.moleWhacked = new window.Image();
      this.images.moleWhacked.src = getGameStaticAssets(
        "WhackaMole",
        "moleWhacked.png"
      );

      this.offsets.board = {
        x: 0,
        y: -this.gameWidth * 0.064,
      };
      this.offsets.option = {
        x: this.gameWidth * 0.04,
        y: -this.gameWidth * 0.04,
      };
      this.offsets.mole = {
        x: 0,
        y: this.gameWidth * 0.08,
      };
      this.offsets.hole = {
        x: 0,
        y: this.gameWidth * 0.07,
      };

      this.boundaries = {
        up: this.gameWidth * 0.08,
        down: this.gameWidth * 0.33,
        left: this.gameWidth * 0.01,
        right: this.gameWidth * 0.83,
      };
    },
    drawBG() {
      this.configBG.image = this.images.bg;
      this.configBG.width = this.gameWidth;
      this.configBG.height = this.gameWidth;
    },
    spawnMole() {
      let id = this.configObjects.position.length;
      let position = this.positionWithoutOverlap();
      this.configObjects.position.push(position);
      this.configObjects.status.push("burrow");

      let cropPercent = 15;
      this.configObjects.cropPercent.push(cropPercent);

      let board = {
        visible: false,
        x: position.x,
        y: canvasTools.offset(position, this.offsets.board).y,
        width: this.gameWidth * 0.16,
        height: this.gameWidth * 0.08,
        image: this.images.board,
      };
      this.configObjects.board.push(board);

      let option = {
        visible: false,
        x: canvasTools.offset(position, this.offsets.option).x,
        y: canvasTools.offset(position, this.offsets.option).y,
        fontSize: this.gameWidth * 0.04,
      };
      this.configObjects.option.push(option);

      let mole = {
        id: id.toString(),
        x: position.x,
        y: canvasTools.offset(position, this.offsets.mole).y,
        width: this.gameWidth * 0.16,
        height: this.gameWidth * 0.0016 * cropPercent,
        image: this.images.mole,
      };
      mole.crop = this.crop(cropPercent).crop;
      this.configObjects.mole.push(mole);

      let hole = {
        x: position.x,
        y: canvasTools.offset(position, this.offsets.hole).y,
        width: this.gameWidth * 0.16,
        height: this.gameWidth * 0.16,
        image: this.images.hole,
      };
      this.configObjects.hole.push(hole);
      window.setTimeout(this.burrowAnimation, 200, id);
      let nextSpawn = Math.random() * 2000 + 1000;
      window.setTimeout(this.spawnMole, nextSpawn);
    },
    positionWithoutOverlap() {
      do {
        var overlap = false;
        var position = canvasTools.randomPosition(this.boundaries);
        for (
          let i = this.startId;
          i < this.configObjects.position.length;
          ++i
        ) {
          if (this.configObjects.position[i] == null) continue;
          if (
            canvasTools.distance(position, this.configObjects.position[i]) <
            this.gameWidth * 0.2
          )
            overlap = true;
        }
      } while (overlap);
      return position;
    },

    initializeOption() {
      this.allOptions = this.GameData.True.concat(this.GameData.False);
      this.trueOptions = this.GameData.True;
    },
    update() {
      for (let i = this.startId; i < this.configObjects.position.length; ++i) {
        this.moleAnimation(i);
      }
    },
    moleAnimation(id) {
      if (this.configObjects.status[id] == "up") {
        this.configObjects.mole[id].y--;
        if (this.configObjects.cropPercent[id] < 100) {
          this.configObjects.cropPercent[id] += 1.2;
          this.configObjects.mole[id].crop = this.crop(
            this.configObjects.cropPercent[id]
          ).crop;
          this.configObjects.mole[id].height = this.crop(
            this.configObjects.cropPercent[id]
          ).height;
        }
        if (this.configObjects.mole[id].y < this.configObjects.position[id].y) {
          this.configObjects.board[id].visible = true;
          this.configObjects.option[id].visible = true;
          this.configObjects.option[id].text = this.getOption();
          this.configObjects.status[id] = "hold";
          window.setTimeout(() => {
            this.configObjects.board[id].visible = false;
            this.configObjects.option[id].visible = false;
            this.configObjects.status[id] = "down";
          }, 2000);
        }
      } else if (this.configObjects.status[id] == "down") {
        this.configObjects.mole[id].y++;
        if (this.configObjects.cropPercent[id] > 0) {
          this.configObjects.cropPercent[id] -= 1.2;
          this.configObjects.mole[id].crop = this.crop(
            this.configObjects.cropPercent[id]
          ).crop;
          this.configObjects.mole[id].height = this.crop(
            this.configObjects.cropPercent[id]
          ).height;
        }
        if (
          this.configObjects.mole[id].y >
          canvasTools.offset(this.configObjects.position[id], this.offsets.mole)
            .y
        ) {
          this.configObjects.status[id] = "hold";
          window.setTimeout(() => {
            this.destory(id);
          }, 1000);
        }
      }
    },
    burrowAnimation(id) {
      if (this.configObjects.hole[id].image == this.images.hole) {
        this.configObjects.hole[id].image = this.images.holeup;
        this.configObjects.hole[id].y = this.configObjects.position[id].y;
        window.setTimeout(this.burrowAnimation, 200, id);
      } else if (this.configObjects.hole[id].image == this.images.holeup) {
        this.configObjects.hole[id].image = this.images.hole;
        this.configObjects.hole[id].y = canvasTools.offset(
          this.configObjects.position[id],
          this.offsets.hole
        ).y;
        switch (this.configObjects.status[id]) {
          case "burrow":
            this.configObjects.status[id] = "burrowOnce";
            window.setTimeout(this.burrowAnimation, 200, id);
            break;
          case "burrowOnce":
            this.configObjects.status[id] = "burrowTwice";
            window.setTimeout(this.burrowAnimation, 200, id);
            break;
          case "burrowTwice":
            this.configObjects.status[id] = "up";
            break;
        }
      }
    },
    crop(cropPercent) {
      return {
        crop: {
          x: 0,
          y: 0,
          width: this.images.mole.width,
          height: this.images.mole.height * 0.01 * cropPercent,
        },
        height: this.gameWidth * 0.0016 * cropPercent,
      };
    },
    destory(i) {
      for (let object in this.configObjects) {
        this.configObjects[object][i] = null;
      }
      for (let i = this.startId; i < this.configObjects.position.length; ++i) {
        this.startId = i;
        if (this.configObjects.position[i] != null) break;
      }
    },
    whacked(e) {
      let id = e.target.attrs.id;
      this.checkAnswer(id);
      if (this.configObjects.mole[id].image == this.images.mole) {
        this.configObjects.status[id] = "hold";
        this.configObjects.mole[id].image = this.images.moleWhacked;
        window.setTimeout(() => {
          this.configObjects.mole[id].image = this.images.mole;
          this.configObjects.status[id] = "down";
          this.configObjects.board[id].visible = false;
          this.configObjects.option[id].visible = false;
        }, 500);
      }
    },
    getOption() {
      return this.allOptions[
        Math.floor(Math.random() * this.allOptions.length)
      ];
    },
    checkAnswer(id) {
      let isCorrect = false;
      for (let answer in this.GameData.True) {
        if (this.GameData.True[answer] == this.configObjects.option[id].text)
          isCorrect = true;
      }
      if (isCorrect) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          this.printCorrectAnswers(),
          this.configObjects.option[id].text,
          "正確",
        ]);
        this.allOptions = this.allOptions.filter(
          (option) => option != this.configObjects.option[id].text
        );
        this.trueOptions = this.trueOptions.filter(
          (option) => option != this.configObjects.option[id].text
        );
      } else if (this.configObjects.option[id].text == null) {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.printCorrectAnswers(),
          "未展示答案",
          "錯誤",
        ]);
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.printCorrectAnswers(),
          this.configObjects.option[id].text,
          "錯誤",
        ]);
      }
      if (this.trueOptions.length == 0) this.$emit("next-question");
    },
    printCorrectAnswers() {
      return this.GameData.Question.concat(":", this.GameData.True.join("/"));
    },
  },
};
</script>

<style scoped lang="scss">
.gameContainer {
  width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
}
</style>
