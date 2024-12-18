<template>
  <div class="markdown-container">
    <template v-for="(element, index) in elements" :key="index">
      <component
        :is="getElementTag(element.el)"
        v-if="!isSpecialElement(element.el)"
      >
        {{ element.content }}
      </component>
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
      <FloatNumPad
        v-if="isShowNumPad"
        :Data="floatNumPadLocation"
        @buttonClicked="fillToInput"
      />
    </template>
  </div>
</template>
<script>
import { defineAsyncComponent } from "vue";
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
    };
  },
  created() {
    this.markdownContent = this.Data.Render;
    this.parseMarkdown();
    emitter.on("checkAnswer", this.markWrong);
  },
  methods: {
    parseMarkdown() {
      const content = this.markdownContent.trim();
      const tokenRegex = /(\$i\$|\$t\$|\$s\$|\$n\$|#\s|##\s|###\s|\*\*|__|\n)/g;
      const tokens = content.split(tokenRegex);
      this.wa = tokens;
      const elements = [];
      let currentTag = null;
      let bold = false;
      let underline = false;

      tokens.forEach((token) => {
        if (token === "$i$") {
          elements.push({ el: "input", content: "" });
        } else if (token === "$t$") {
          elements.push({ el: "tab", content: "" });
        } else if (token === "$s$") {
          elements.push({ el: "space", content: "" });
        } else if (token === "$n$" || token === "\n") {
          elements.push({ el: "br", content: "" });
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
      return ["input", "tab", "space", "br"].includes(el);
    },
    checkAnswer() {
      if (typeof this.Data.Answer != "object") return;
      this.wrongInputIndex = [];
      this.resetInputBG();
      let check = true;
      let userAnswer = this.elements
        .filter((element) => element.el === "input")
        .map((element) => element.content);
      for (let i = 0; i < this.Data.Answer.length; i++) {
        if (this.Data.Answer[i] != userAnswer[i]) {
          check = false;
          this.wrongInputIndex.push(i);
        }
      }
      if (check) {
        this.$emit("replyAnswer", true);
      } else {
        this.$emit("replyAnswer", false);
      }
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
      this.$refs.inputRefs.forEach((input) => {
        input.style.backgroundColor = "white";
      });
    },
    showKeyboard(event, index) {
      this.clickedTarget = index;
      this.clickedEvent = event;
      this.isShowNumPad = true;
      this.floatNumPadLocation = {
        top: event.clientY,
        left: event.clientX,
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
      let cnt = 0;
      this.elements.forEach((element, index) => {
        if (element.el === "input") {
          if (this.wrongInputIndex.includes(cnt)) {
            this.$refs.inputRefs[cnt].style.backgroundColor = "red";
          }
          cnt++;
        }
      });
    },
  },
};
</script>
<style scoped lang="scss">
input {
  min-width: 50px;
  max-width: 100px;
  border: 1px solid #000;
  border-radius: $border-radius;
  padding: 5px;
  margin: 5px;
}
.markdown-container {
  span,
  p {
    font-size: $text-medium;
  }
}
</style>
