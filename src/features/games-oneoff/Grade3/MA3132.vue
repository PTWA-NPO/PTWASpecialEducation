<template>
  <div class="game-container">
    <template v-if="gameLevel === 1">
      <Level1
        ref="level1"
        :game-id="gameId"
        :image-data="imageData"
        :markdown-data="markdownData"
        :questions="questions"
        :submit-tick="submitTick"
        @play-effect="$emit('play-effect', $event)"
        @next-question="$emit('next-question')"
      />
    </template>
    <template v-if="gameLevel === 2">
      <Level2
        ref="level2"
        :game-id="gameId"
        :game-data="gameData"
        :submit-tick="submitTick"
        @play-effect="$emit('play-effect', $event)"
        @next-question="$emit('next-question')"
      />
    </template>
    <template v-if="gameLevel === 3">
      <Level3
        ref="level3"
        :game-id="gameId"
        :game-data="gameData"
        :image-data="imageData"
        :markdown-data="markdownData"
        :boxes="boxes"
        :submit-tick="submitTick"
        @play-effect="$emit('play-effect', $event)"
        @next-question="$emit('next-question')"
      />
    </template>
    <!-- <div class="button-container">
      <button class="submit-btn" @click="submitAnswer">送出答案</button>
    </div> -->
  </div>
</template>

<script>
import Level1 from "./games/MA3132/Level1.vue";
import Level2 from "./games/MA3132/Level2.vue";
import Level3 from "./games/MA3132/Level3.vue";
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";
export default {
  name: "MA3132",
  components: {
    Level1,
    Level2,
    Level3,
  },
  props: {
    gameData: {
      type: Object,
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    },
  },
  emits: ["play-effect", "next-question"],
  data() {
    return {
      imageData: this.gameData.imageData,
      markdownData: this.gameData.markdownData,
      questions: this.gameData.Questions,
      gameLevel: this.gameData.GameLevel,
      boxes: this.gameData.Boxes,
      submitTick: 0,
    };
  },
  created() {
    emitter.on("submitAnswer", this.submitAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.submitAnswer);
  },
  methods: {
    submitAnswer() {
      this.submitTick++;
    },
  },
};
</script>

<style scoped lang="scss">
.game-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $gap--small;
}

.button-container {
  display: flex;
  justify-content: center;
  padding: $padding--small;
}

.submit-btn {
  background-color: $submit-color;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s;

  &:hover {
    background-color: darken($submit-color, 10%);
  }
}
</style>
