<template>
  <div class="outter-container container">
    <div class="head-container">
      {{ gameData.headQuestion }}
    </div>
    <div class="game-area">
      <DrawShapes
        id="draw-shapes"
        :component-config="configDrawShapes"
        :game-id="gameId"
        @reply-answer="getComponentsReply"
      />
    </div>
    <!-- <button class="submit-btn" @click="checkAnswer">送出答案</button> -->
  </div>
</template>

<script>
import DrawShapes from "@/components/DrawShapes.vue";
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";
export default {
  name: "MA3056",
  components: {
    DrawShapes,
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
      componentsReplyAnswer: false,
      configDrawShapes: {
        verifyOption: "rect", //none, rect, shape
        answer: [5, 3], //[5, 3], // triangle, rectangle, trapezium, parallelogram
        bgRatio: {
          width: 10,
          height: 10,
        },
      },
    };
  },
  computed: {
    // Add your computed properties here
  },
  created() {
    // Add your created methods here
    this.configDrawShapes.answer = this.gameData.answer;
    emitter.on("submitAnswer", this.checkAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.checkAnswer);
  },
  methods: {
    // Add your component methods here
    getComponentsReply(answer) {
      this.componentsReplyAnswer = answer;
    },
    checkAnswer() {
      if (this.componentsReplyAnswer) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
      }
    },
  },
};
</script>

<style scoped lang="scss">
.outter-container {
  display: flex;
  flex-direction: column;
  gap: $gap--medium;
  .head-container {
    @extend .container-basic;
    background-color: $primary-color;
    padding: $gap--small;
    display: flex;
    align-items: center;
    font-size: $text-large;
  }
  .game-area {
    border-radius: $border-radius;
    display: flex;
    justify-content: center;
    #draw-shapes {
      width: 30%;
    }
  }
  .submit-btn {
    @extend .button--animation;
    height: 4rem;
    background-color: $submit-color;
  }
}
</style>
