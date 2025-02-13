<template>
  <div class="interactive-equation">
    <div class="interactive-equation__container">
      <template v-for="(item, index) in parsedEquation" :key="index">
        <template v-if="item.isInput">
          <div v-if="item.isSymbol" class="interactive-equation__symbol">
            <q-btn
              :label="userAnswers[index] || '?'"
              class="interactive-equation__symbol-btn"
              rounded
            >
              <q-menu anchor="bottom start" self="top left">
                <q-item
                  v-for="symbol in availableSymbols"
                  :key="symbol"
                  v-close-popup
                  clickable
                  dense
                  @click="handleSymbolSelect(index, symbol)"
                >
                  {{ symbol }}
                </q-item>
              </q-menu>
            </q-btn>
          </div>
          <input
            v-else
            v-model="userAnswers[index]"
            type="text"
            class="interactive-equation__input"
            @touchstart="handleInputClick(index, $event)"
          />
        </template>
        <span v-else class="interactive-equation__text">{{ item.value }}</span>
      </template>
    </div>
    <div
      v-if="Data.finalAnswerTemplate"
      class="interactive-equation__final-answer"
    >
      <span class="interactive-equation__text">答:</span>
      <template
        v-for="(item, index) in parsedFinalAnswer"
        :key="`final-${index}`"
      >
        <input
          v-if="item.isInput"
          v-model="finalAnswers[index]"
          type="text"
          class="interactive-equation__input"
          @touchstart="handleFinalAnswerClick($event, index)"
        />
        <span v-else class="interactive-equation__text">{{ item.value }}</span>
      </template>
    </div>

    <FloatNumPad
      v-if="showNumPad"
      :Data="numPadPosition"
      @buttonClicked="handleNumPadInput"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: "InteractiveMathEquation",

  components: {
    FloatNumPad: defineAsyncComponent(() =>
      import("@/components/FloatNumPad.vue")
    ),
  },

  props: {
    Data: {
      type: Object,
      required: true,
      validator(value) {
        return value.equation && Array.isArray(value.answers);
      },
    },
    ID: {
      type: String,
      required: true,
    },
  },

  emits: ["replyAnswer"],

  data() {
    return {
      equation: "",
      answers: [],
      userAnswers: {},
      parsedEquation: [],
      availableSymbols: ["+", "-", "×", "÷"],
      showNumPad: false,
      numPadPosition: {
        top: 0,
        left: 0,
      },
      activeInputIndex: null,
      numPadOffset: 10,
      finalAnswers: {},
      parsedFinalAnswer: [],
    };
  },

  computed: {
    isAllInputsValid() {
      return (
        this.areAllAnswersFilled() &&
        this.areAllAnswersCorrect() &&
        this.areFinalAnswersCorrect()
      );
    },
  },

  created() {
    this.initialize();
  },

  methods: {
    initialize() {
      this.equation = this.Data.equation;
      this.answers = this.Data.answers;
      this.parseEquationString();
      this.parseFinalAnswerString();
    },

    parseEquationString() {
      this.parsedEquation = this.parseTemplate(this.equation);
    },

    parseTemplate(template, createPartFn = this.createEquationPart) {
      if (!template) return [];
      return template.split(" ").map(createPartFn);
    },

    createEquationPart(part) {
      const isInputPart = part === "_" || part === "$";
      return {
        value: isInputPart ? "" : part,
        isInput: isInputPart,
        isSymbol: part === "$",
      };
    },

    handleSymbolSelect(index, symbol) {
      this.userAnswers[index] = symbol;
      this.validateAnswers();
    },

    handleInputClick(index, event) {
      this.activeInputIndex = index;
      this.updateNumPadPosition(event.target);
      this.showNumPad = true;
    },

    updateNumPadPosition(targetElement) {
      const rect = targetElement.getBoundingClientRect();
      this.numPadPosition = {
        top: `${rect.bottom + window.scrollY + this.numPadOffset}px`,
        left: `${rect.left + window.scrollX}px`,
      };
    },

    handleNumPadInput(value) {
      const actions = {
        清除: () => this.clearInput(),
        關閉: () => this.closeNumPad(),
        default: () => this.updateInputValue(value),
      };

      (actions[value] || actions.default)();
      this.validateAnswers();
    },

    clearInput() {
      if (
        typeof this.activeInputIndex === "string" &&
        this.activeInputIndex.startsWith("final-")
      ) {
        const index = this.activeInputIndex.split("-")[1];
        this.finalAnswers[index] = "";
      } else if (this.activeInputIndex !== null) {
        this.userAnswers[this.activeInputIndex] = "";
      }
    },

    closeNumPad() {
      this.showNumPad = false;
      this.activeInputIndex = null;
    },

    updateInputValue(value) {
      if (
        typeof this.activeInputIndex === "string" &&
        this.activeInputIndex.startsWith("final-")
      ) {
        const index = this.activeInputIndex.split("-")[1];
        this.finalAnswers[index] = (this.finalAnswers[index] || "") + value;
      } else if (this.activeInputIndex !== null) {
        const currentValue = this.userAnswers[this.activeInputIndex] || "";
        this.userAnswers[this.activeInputIndex] = currentValue + value;
      }
    },

    handleFinalAnswerClick(event, index) {
      this.activeInputIndex = `final-${index}`;
      this.updateNumPadPosition(event.target);
      this.showNumPad = true;
    },

    validateAnswers() {
      if (this.isAllInputsValid) {
        this.$emit("replyAnswer", true);
      }
    },

    areAllAnswersFilled() {
      const userAnswerValues = Object.values(this.userAnswers);
      return (
        userAnswerValues.length === this.answers.length &&
        userAnswerValues.every(this.isValidAnswer)
      );
    },

    isValidAnswer(answer) {
      return (
        answer !== null &&
        answer !== undefined &&
        answer.toString().trim() !== ""
      );
    },

    areAllAnswersCorrect() {
      return Object.entries(this.userAnswers).every(([index, answer]) =>
        this.isAnswerCorrect(index)
      );
    },

    isAnswerCorrect(index) {
      const userAnswer = this.userAnswers[index];
      const answerIndex = Object.keys(this.userAnswers).indexOf(
        index.toString()
      );
      return userAnswer === this.answers[answerIndex];
    },

    areFinalAnswersCorrect() {
      return Object.entries(this.finalAnswers).every(
        ([index, answer]) => answer === this.Data.finalAnswers[index]
      );
    },

    parseFinalAnswerString() {
      if (!this.Data.finalAnswerTemplate) return;

      const parts = this.Data.finalAnswerTemplate.split(" ");
      this.parsedFinalAnswer = parts.map((part) => ({
        value: part === "_" ? "" : part,
        isInput: part === "_",
      }));
    },
  },
};
</script>

<style lang="scss" scoped>
.interactive-equation {
  $self: &;
  font-size: 24px;

  &__container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    gap: $gap--tiny;
  }

  &__input {
    width: 40px;
    height: 40px;
    text-align: center;
    font-size: inherit;
    border: 2px solid;
    border-radius: $border-radius;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #4a4aff;
    }
  }

  &__symbol-btn {
    border-radius: 20px;
    font-weight: bold;
    padding: 0;
    min-width: 40px;
    height: 40px;
  }

  &__text {
    font-size: inherit;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  &__final-answer {
    display: flex;
    gap: $gap--small;
    align-items: center;
  }
}
</style>
