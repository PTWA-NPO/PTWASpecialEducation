<template>
  <div class="container">
    <div class="gameAndQuestion">
      <p class="h1">
        {{ GameData.Text }}
      </p>
      <div class="ObjList">
        <p class="h4">尚未被找到:</p>
        <div class="Objects">
          <button
            v-for="(button, index) in GameData.Objs"
            class="Object"
            :class="{ activebutton: answered[index] }"
          >
            {{ button.Name }}
          </button>
        </div>
      </div>
      <div class="Game">
        <v-stage
          ref="stage"
          :config="stageSize"
          @click="handleMouseClick"
          @touchstart="handleMouseClick"
        >
          <v-layer ref="layer">
            <v-image :config="imageConfig" />
            <v-circle
              v-for="(circle, index) in circles"
              :key="index"
              :config="circle"
            />
          </v-layer>
        </v-stage>
      </div>
    </div>
  </div>
</template>
<script>
import { getGameAssets } from "@/utilitys/get_assets.js";
export default {
  name: "FindTheItem",
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
    //Other Game Methods
  },
  emits: ["play-effect", "add-record", "next-question"],
  data() {
    return {
      questionNum: 0,
      rightAnswerCount: 0,
      correctlyAnsweredQuestions: [],
      randomQuestionOrder: [],
      stageSize: {
        width: 800,
        height: 600,
      },
      imageConfig: {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        image: null,
      },
      circles: [],
      answered: [],
    };
  },
  created() {
    const image = new window.Image();
    image.src = getGameAssets(this.ID, this.GameData.img);
    image.onload = () => {
      const aspectRatio = image.width / image.height;
      if (this.stageSize.width / this.stageSize.height > aspectRatio) {
        this.imageConfig.height = this.stageSize.height;
        this.imageConfig.width = this.stageSize.height * aspectRatio;
      } else {
        this.imageConfig.width = this.stageSize.width;
        this.imageConfig.height = this.stageSize.width / aspectRatio;
      }
      this.imageConfig.image = image;
    };
  },
  mounted() {},
  methods: {
    handleMouseClick() {
      const mousePos = this.$refs.stage.getNode().getPointerPosition();
      let answer = this.checkAnswer(mousePos.x, mousePos.y);
      if (!this.answered[answer]) {
        this.answered[answer] = true;
        this.addCircle(answer);
        if (this.gameOver()) {
          this.$emit("next-question", true);
        }
        this.$emit("play-effect", "CorrectSound");
      }
    },
    checkAnswer(posX, posY) {
      const tolerance = this.GameData.tolerance;
      for (let i in this.GameData.Objs) {
        let obj = this.GameData.Objs[i];
        if (
          posX >= obj.xRange[0] - tolerance &&
          posX <= obj.xRange[1] + tolerance &&
          posY >= obj.yRange[0] - tolerance &&
          posY <= obj.yRange[1] + tolerance
        ) {
          return i;
        }
      }
    },
    addCircle(checkNum) {
      const obj = this.GameData.Objs[checkNum];
      const radius =
        Math.sqrt(
          (obj.xRange[1] - obj.xRange[0]) ** 2 +
            (obj.yRange[1] - obj.yRange[0]) ** 2
        ) / 2;
      this.circles.push({
        x: (obj.xRange[0] + obj.xRange[1]) / 2,
        y: (obj.yRange[0] + obj.yRange[1]) / 2,
        radius: radius,
        stroke: "red",
        strokeWidth: 2,
      });
    },
    gameOver() {
      let rightAnswerCount = 0;
      while (this.answered[rightAnswerCount]) {
        rightAnswerCount++;
      }
      if (rightAnswerCount >= this.GameData.Objs.length) {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.h1 {
  margin-bottom: 0.3rem;
  border: black 2px solid;
  border-radius: 15px;
  padding: 0.3rem;
  text-align: center;
  font-size: 1.5rem;
}

.Game {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 0.5rem;
}

.ObjList {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  margin-bottom: 0.3rem;
  align-items: center;
  align-self: center;
}

.ObjList p {
  align-self: center;
  margin: 0;
  text-align: center;
  font-size: 1.2rem;
}

.Objects {
  display: flex;
  justify-content: center;
  gap: 0.8rem;
}

.Object {
  background-color: #ffb703;
  border-radius: 8px;
  border: none;
  padding: 0.4rem;
  font-size: 1rem;
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
}

.activebutton {
  background-color: #606c38 !important;
  color: white;
}
</style>
