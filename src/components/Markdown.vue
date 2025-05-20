<template>
  <div class="markdown-container">
    <template v-for="(element, index) in elements" :key="index">
      <component
        :is="getElementTag(element.el)"
        v-if="!isSpecialElement(element.el)"
      >
        {{ element.content }}
      </component>
      <div v-else-if="element.el === 'math-input'" class="math-input-container">
        <q-btn
          v-if="element.isSymbol"
          :label="element.content || '?'"
          class="math-symbol-btn"
          :class="{ 'wrong-answer': element.isWrong }"
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
        v-else-if="element.el === 'input'"
        ref="inputRefs"
        v-model="element.content"
        type="text"
        @input="checkAnswer($event)"
        @click="
          (event) => {
            showKeyboard(event, index);
            disableKeyboardOnMobile(event);
          }
        "
      />
      <span v-else-if="element.el === 'tab'">&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <span v-else-if="element.el === 'space'">&nbsp;</span>
      <br v-else-if="element.el === 'br'" />
      <div v-else-if="element.el === 'options'" class="options-container">
        <div
          v-for="(option, optionIndex) in element.content"
          :key="optionIndex"
          class="option"
          :class="{ selected: selectedOptions[index] === optionIndex }"
          @click="selectOption(index, optionIndex)"
        >
          {{ option }}
        </div>
      </div>
      <FloatNumPad
        v-if="isShowNumPad"
        :Data="floatNumPadLocation"
        @buttonClicked="fillToInput"
      />
    </template>
  </div>
</template>
<script>
import FloatNumPad from "@/components/FloatNumPad.vue";
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";
export default {
  components: {
    FloatNumPad,
  },
  props: {
    Data: {
      type: Object,
      required: true,
    },
    ID: {
      type: String,
      required: true,
    },
  },
  emits: ["replyAnswer"],
  data() {
    return {
      markdownContent: ``,
      elements: [],
      floatNumPadLocation: { top: 0, left: 0 },
      isShowNumPad: false,
      clickedTarget: null,
      clickedEvent: null,
      wrongInputIndex: [],
      numPadOffset: 10,
      availableSymbols: ["+", "-", "×", "÷"],
      selectedOptions: {},
    };
  },
  created() {
    this.markdownContent = this.Data.Render;
    this.parseMarkdown();
    emitter.on("checkAnswer", this.markWrong);
  },
  beforeUnmount() {
    emitter.off("checkAnswer", this.markWrong);
  },
  methods: {
    parseMarkdown() {
      const content = this.markdownContent.trim();
      const tokenRegex =
        /(\$i\$|\$t\$|\$s\$|\$n\$|\$\$|#\s|##\s|###\s|\*\*|__|\n|\$\[.*?\]\$)/g;
      const tokens = content.split(tokenRegex);
      this.wa = tokens;
      const elements = [];
      let currentTag = null;
      let bold = false;
      let underline = false;

      tokens.forEach((token) => {
        if (token === "$i$") {
          elements.push({ el: "input", content: "" });
        } else if (token === "$$") {
          elements.push({ el: "math-input", content: "", isSymbol: true });
        } else if (token === "$t$") {
          elements.push({ el: "tab", content: "" });
        } else if (token === "$s$") {
          elements.push({ el: "space", content: "" });
        } else if (token === "$n$" || token === "\n") {
          elements.push({ el: "br", content: "" });
        } else if (token.startsWith("$[") && token.endsWith("]$")) {
          // 解析選項
          const options = token
            .slice(2, -2)
            .split(",")
            .map((option) => option.trim());
          elements.push({ el: "options", content: options });
        } else if (token === "# ") {
          currentTag = "h1";
        } else if (token === "## ") {
          currentTag = "h2";
        } else if (token === "### ") {
          currentTag = "h3";
        } else if (token === "**") {
          bold = !bold;
        } else if (token === "__") {
          underline = !underline;
        } else if (token.trim() === "") {
          // Ignore empty strings
        } else {
          // Process text content with possible formatting
          let el = currentTag || (bold ? "b" : underline ? "u" : "span");
          elements.push({ el: el, content: token });
          currentTag = null;
        }
      });

      this.elements = elements;
    },
    getElementTag(el) {
      const validTags = ["h1", "h2", "h3", "p", "b", "u", "li", "span"];
      return validTags.includes(el) ? el : "span";
    },
    isSpecialElement(el) {
      return ["input", "math-input", "tab", "space", "br", "options"].includes(
        el
      );
    },
    checkAnswer() {
      if (typeof this.Data.Answer != "object") return;
      this.wrongInputIndex = [];
      this.resetInputBG();
      let check = true;
      let allAnswers = [];

      // 獲取所有輸入框的答案
      this.elements.forEach((element, index) => {
        if (element.el === "input" || element.el === "math-input") {
          allAnswers.push(element.content);
        } else if (element.el === "options") {
          const selectedOption = this.selectedOptions[index];
          if (selectedOption !== undefined) {
            allAnswers.push(element.content[selectedOption]);
          } else {
            allAnswers.push("");
          }
        }
      });
      // 檢查輸入框數量是否匹配

      const isAnswerCorrect = (userAns, correctAns) => {
        if (!isNaN(correctAns)) {
          return Number(userAns) === Number(correctAns);
        }
        return userAns === correctAns;
      };

      for (let i = 0; i < this.Data.Answer.length; i++) {
        const userAnswer = allAnswers[i].trim();
        const correctAnswer = this.Data.Answer[i];

        if (!isAnswerCorrect(userAnswer, correctAnswer)) {
          check = false;
          this.wrongInputIndex.push(i);
        }
      }
      console.log(check);

      this.$emit("replyAnswer", check);
    },
    disableKeyboardOnMobile($event) {
      const input = $event.target;
      // Check if the user is on a mobile device
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        input.setAttribute("readonly", "true");
      } else {
        input.removeAttribute("readonly");
      }
    },
    resetInputBG() {
      if (!this.$refs.inputRefs) return;
      // 兼容單一 input 的情況
      if (Array.isArray(this.$refs.inputRefs)) {
        this.$refs.inputRefs.forEach((input) => {
          if (input) input.style.backgroundColor = "white";
        });
      } else {
        // 單一 input
        this.$refs.inputRefs.style.backgroundColor = "white";
      }
    },
    showKeyboard(event, index) {
      this.clickedTarget = index;
      this.clickedEvent = event;
      const inputRect = event.target.getBoundingClientRect();
      this.isShowNumPad = true;
      this.floatNumPadLocation = {
        top: `${inputRect.bottom + window.scrollY}px`,
        left: `${inputRect.right + window.scrollX + this.numPadOffset}px`,
      };
    },
    fillToInput(content) {
      if (content == "關閉") {
        this.isShowNumPad = false;
        return;
      }
      if (this.clickedTarget !== null) {
        if (content == "清除") {
          this.elements[this.clickedTarget].content = "";
          this.checkAnswer();
          return;
        }
        this.elements[this.clickedTarget].content += content;
        this.checkAnswer();
      }
    },
    markWrong() {
      this.checkAnswer();
      let totalIndex = 0;
      let inputIndex = 0;
      // 先檢查 inputRefs 是否存在
      if (!this.$refs.inputRefs) {
        console.warn("inputRefs not found");
        return;
      }

      this.elements.forEach((element) => {
        if (element.el === "input") {
          if (
            this.wrongInputIndex.includes(totalIndex) &&
            this.$refs.inputRefs[inputIndex]
          ) {
            this.$refs.inputRefs[inputIndex].style.backgroundColor = "red";
          }
          inputIndex++;
          totalIndex++;
        } else if (element.el === "math-input") {
          element.isWrong = this.wrongInputIndex.includes(totalIndex);
          totalIndex++;
        }
      });
    },
    handleSymbolSelect(index, symbol) {
      this.elements[index].content = symbol;
      this.checkAnswer();
    },
    selectOption(elementIndex, optionIndex) {
      // 保存原始選項列表
      const element = this.elements[elementIndex];
      if (element && element.el === "options") {
        // 保存選中的值，但保持原始選項列表不變
        element.selectedValue = element.content[optionIndex];
      }
      this.selectedOptions[elementIndex] = optionIndex;
      this.checkAnswer();
    },
  },
};
</script>

<style scoped lang="scss">
.math-input-container {
  display: inline-block;
  margin: 0 5px;
}

.math-symbol-btn {
  border-radius: 20px;
  font-size: $text-small;
  padding: 0;
  min-width: 40px;
  height: 40px;

  &.wrong-answer {
    background-color: red !important;
    color: white !important;
  }
}

input {
  min-width: 20px;
  max-width: 50px;
  border: 1px solid #000;
  border-radius: $border-radius;
  padding: 5px;
  margin: 5px;
}
.markdown-container {
  width: 100%;
  height: 100%;
  span,
  p {
    font-size: $text-medium;
    margin: 0;
    padding: 0;
  }
  h1,
  h2,
  h3 {
    margin: 0;
    padding: 0;
  }
  br {
    margin: 0;
    padding: 0;
  }
}

.options-container {
  display: inline-flex;
  gap: 10px;
  margin: 0 5px;
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

  &:hover {
    background-color: #e9e9e9;
  }

  &.selected {
    border-color: $hyperlink-color;
    background-color: $success-color;
    color: white;
  }
}
</style>
