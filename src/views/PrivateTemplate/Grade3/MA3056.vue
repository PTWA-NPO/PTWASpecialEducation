<template>
  <div class="outter-container container">
    <div class="head-container">
      {{ GameData.headQuestion }}
    </div>
    <div class="game-area">
      <DrawShapes
        id="draw-shapes"
        :Data="configDrawShapes"
        :ID="ID"
        @reply-answer="getComponentsReply"
      />
    </div>
    <button class="submit-btn" @click="checkAnswer">檢查答案</button>
  </div>
</template>

<script>
import DrawShapes from "@/components/DrawShapes.vue";
export default {
  name: "MA3056",
  components: {
    DrawShapes,
  },
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
  emits: ["play-effect", "next-question"],
  data() {
    return {
      id: "MA3056",
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
    this.configDrawShapes.answer = this.GameData.answer;
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
