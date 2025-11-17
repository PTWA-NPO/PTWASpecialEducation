<template>
  <div class="level-container">
    <ImageContainer
      :game-id="gameId"
      :component-config="imageData"
      class="image-container"
    />
    <div class="question-container">
      <div class="questions-flex">
        <div
          v-for="(question, qIndex) in currentQuestions"
          :key="qIndex"
          class="question"
        >
          <div
            v-for="(part, index) in splitQuestion(question.text)"
            :key="index"
            class="part-container"
          >
            <p v-if="!isPlaceHolder(part)">{{ part }}</p>
            <div
              v-for="(option, optionIndex) in question.options"
              v-else
              :key="optionIndex"
              class="option"
              :class="{
                selected: selectedAnswers[qIndex] === optionIndex,
                wrong:
                  wrongOptions.includes(qIndex) &&
                  selectedAnswers[qIndex] === optionIndex,
              }"
              @click="selectAnswer(qIndex, optionIndex)"
            >
              {{ option }}
            </div>
          </div>
        </div>
      </div>
      <Markdown
        :game-id="gameId"
        :component-config="markdownData"
        @reply-answer="handleMarkdownReply"
      />
    </div>
  </div>
</template>

<script>
import ImageContainer from "@/components/ImageContainer.vue";
import Markdown from "@/components/MarkdownRenderer.vue";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";

export default {
  name: "MA3132Level1",
  components: {
    ImageContainer,
    Markdown,
  },
  props: {
    gameId: {
      type: String,
      required: true,
    },
    imageData: {
      type: Object,
      required: true,
    },
    markdownData: {
      type: Object,
      required: true,
    },
    questions: {
      type: Array,
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
      currentQuestionIndex: 0,
      selectedAnswers: [null, null],
      markdownAnswer: false,
      wrongOptions: [],
    };
  },
  computed: {
    currentQuestions() {
      return [
        this.questions[this.currentQuestionIndex],
        this.questions[this.currentQuestionIndex + 1],
      ].filter((q) => q);
    },
  },
  watch: {
    submitTick() {
      this.submitAnswer();
    },
  },
  methods: {
    handleMarkdownReply(answer) {
      this.markdownAnswer = answer;
    },
    splitQuestion(question) {
      return question.split(/(\$question\$)/g);
    },
    isPlaceHolder(part) {
      return part === "$question$";
    },
    selectAnswer(qIndex, optionIndex) {
      this.wrongOptions = [];
      this.selectedAnswers[qIndex] = optionIndex;
    },
    submitAnswer() {
      let allCorrect = true;
      this.wrongOptions = [];

      this.currentQuestions.forEach((question, index) => {
        if (this.selectedAnswers[index] !== question.correctAnswer) {
          allCorrect = false;
          this.wrongOptions.push(index);
        }
      });

      if (allCorrect && this.markdownAnswer) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        emitter.emit("checkAnswer");
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
  max-height: 90%;
}

.image-container {
  width: 100%;
  height: 200px;
}

.question-container {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  border-radius: 10px;
  padding: $padding--small;
  gap: $gap--small;
}

.questions-flex {
  display: flex;
  flex-direction: column;
  gap: $gap--small;
}

.question {
  font-size: 1.2em;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: $gap--small;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.part-container {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: $gap--small;
  white-space: nowrap;
}

.part-container p {
  margin: 0;
  display: inline;
}

.option {
  background-color: white;
  border: 2px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 80px;
  text-align: center;
  display: inline-block;
  margin: 0;
}

.option:hover {
  background-color: #e9e9e9;
}

.option.selected {
  border-color: $hyperlink-color;
  background-color: $success-color;
}

.option.wrong {
  border-color: #ff3154;
  background-color: rgba(255, 49, 84, 0.1);
}
</style>
