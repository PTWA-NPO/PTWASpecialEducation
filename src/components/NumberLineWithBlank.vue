<template>
  <div ref="container" class="gameContainer">
    <v-stage ref="stage" :config="configKonva">
      <v-layer>
        <v-line
          v-for="(line, index) in configNumberLine"
          :key="index"
          :config="line"
        />
        <!-- <v-circle v-for="circle in configCircle" :config="circle"></v-circle> -->
        <v-text
          v-for="(number, index) in configNumber"
          :key="index"
          :config="number"
        />
        <v-rect
          v-for="(rect, id) in configRect"
          :key="id"
          :config="{
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            fill: rect.fill,
            cornerRadius: rect.cornerRadius,
            stroke: rectClickedList[id] ? 'blue' : 'black',
            strokeWidth: rectClickedList[id] ? 3 : 1,
          }"
          @click="rectClicked(id, rect)"
          @touchstart="rectClicked(id, rect)"
        ></v-rect>
      </v-layer>
    </v-stage>
    <FloatingNumPad
      v-if="virtualNumpadSwitch"
      :Data="{ top: menuPosition.top + 'px', left: menuPosition.left + 'px' }"
      @buttonClicked="numPadButtonClicked"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
export default {
  components: {
    FloatingNumPad: defineAsyncComponent(() =>
      import("@/components/FloatNumPad.vue")
    ),
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
      configKonva: {},
      configCircle: [],

      configNumberLine: [],
      configNumber: [],
      numberX: [],

      virtualNumpadSwitch: false,

      configRect: [],
      isClickRectID: undefined,
      rectClickedList: [],
      rectPadding: 5,

      blankContent: [],

      startNum: 0,
      endNum: 300,

      isImage: true,
      menuAnchor: null,
      menuPosition: { top: 0, left: 0 },
      maxDigits: 3,
      currentInput: "",

      NUMBER_LINE_Y_RATIO: 0.15,
      LINE_X_START_RATIO: 0.05,
      LINE_X_END_RATIO: 0.95,
      ARROW_OFFSET_RATIO: 0.01,
      RECT_PADDING: 5,
      FONT_SIZE_RATIO: 0.03,
      DIGIT_OFFSET_RATIO: 0.0085,
      RECT_CORNER_RADIUS: 15,
    };
  },
  mounted() {
    this.initializeScene();
    this.initializeNumberLine();
    window.addEventListener("resize", () => {
      this.initializeScene();
      this.initializeNumberLine();
    });
  },
  methods: {
    initializeScene() {
      this.gameWidth = this.$refs.container.clientWidth;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameWidth / 4;
    },
    initializeNumberLine() {
      this.drawBaseLine(); // 繪製數線的主線條
      this.drawNumberLine(); // 繪製數線上的標記
      this.drawNumbers(); // 繪製數線上的數字
    },
    drawBaseLine() {
      this.numberLineY = this.gameWidth * 0.15;

      const baseLinePoints = [
        [this.LINE_X_START_RATIO, 0, this.LINE_X_END_RATIO, 0],
        [
          this.LINE_X_END_RATIO - this.ARROW_OFFSET_RATIO,
          -this.ARROW_OFFSET_RATIO,
          this.LINE_X_END_RATIO,
          0,
        ],
        [
          this.LINE_X_END_RATIO - this.ARROW_OFFSET_RATIO,
          this.ARROW_OFFSET_RATIO,
          this.LINE_X_END_RATIO,
          0,
        ],
      ];

      this.configNumberLine = baseLinePoints.map((relativePoints) => ({
        stroke: "black",
        points: this.convertRelativeToAbsolute(relativePoints),
      }));
    },
    convertRelativeToAbsolute(relativePoints) {
      return relativePoints.map((relativePoint, index) => {
        const isYAxis = index % 2 === 1;
        const baseValue = relativePoint * this.gameWidth;
        return isYAxis ? baseValue + this.numberLineY : baseValue;
      });
    },
    drawNumberLine() {
      const intervalLength = this.calculateIntervalLength();
      const markerCount =
        (this.Data.max - this.Data.min) / this.Data.spacing + 1;

      for (let index = 0; index < markerCount; index++) {
        const xPosition = this.getMarkerPosition(index, intervalLength);
        this.numberX.push(xPosition);

        this.configNumberLine.push({
          stroke: "black",
          points: [
            xPosition,
            this.numberLineY - this.gameWidth * this.ARROW_OFFSET_RATIO,
            xPosition,
            this.numberLineY + this.gameWidth * this.ARROW_OFFSET_RATIO,
          ],
        });
      }
    },
    getMarkerPosition(index, intervalLength) {
      return (
        this.gameWidth * this.LINE_X_START_RATIO +
        intervalLength * (index + 0.5)
      );
    },
    calculateIntervalLength() {
      return (
        (this.gameWidth * 0.9) /
        ((this.Data.max - this.Data.min) / this.Data.spacing + 1)
      );
    },
    drawNumbers() {
      this.numberY = this.calculateNumberY();

      Array.from(
        { length: (this.Data.max - this.Data.min) / this.Data.spacing + 1 },
        (_, j) => {
          const currentValue = this.Data.min + j * this.Data.spacing;
          const offset = this.calculateDigitOffset(currentValue);

          if (this.isBlankPosition(currentValue)) {
            this.configRect.push(this.createRectConfig(j, offset));
            this.blankContent.push("");
            this.configNumber.push(this.createNumberConfig("", j, offset));
          } else {
            this.configNumber.push(
              this.createNumberConfig(currentValue, j, offset)
            );
          }
        }
      );
    },
    calculateNumberY() {
      return this.gameWidth * 0.175;
    },
    isBlankPosition(value) {
      return this.Data.blank_pos.includes(value);
    },
    calculateDigitOffset(value) {
      return value === 0
        ? this.gameWidth * 0.0085
        : Math.ceil(Math.log10(Math.abs(value))) * this.gameWidth * 0.0085;
    },
    createNumberConfig(value, index, offset) {
      return {
        text: value.toString(),
        fontSize: this.gameWidth * 0.03,
        x: this.numberX[index] - offset,
        y: this.numberY,
      };
    },

    createRectConfig(index, offset) {
      return {
        x: this.numberX[index] - offset - this.rectPadding,
        y: this.numberY - this.rectPadding,
        width:
          this.gameWidth * 0.02 * (Math.floor(Math.log10(this.Data.max)) + 1) +
          this.rectPadding,
        height: this.gameWidth * 0.03 + this.rectPadding,
        fill: "rgba(255, 255, 255, 0)",
        cornerRadius: 15,
        textID: index,
      };
    },
    rectClicked(id, rect) {
      this.isClickRectID = id;
      this.deselectAllRects();
      this.rectClickedList[id] = true;

      this.updateMenuPosition(rect);
      this.openNumPad();
    },
    updateMenuPosition(rect) {
      const stage = this.$refs.stage.getStage();
      const pointerPos = stage.getPointerPosition();

      const containerRect = this.$refs.container.getBoundingClientRect();
      const rectTop = containerRect.top + rect.y + rect.height;
      const rectLeft = containerRect.left + rect.x;

      this.menuPosition = {
        top: rectTop + 10,
        left: rectLeft,
        id: this.isClickRectID,
      };
    },
    openNumPad() {
      this.currentInput = "";
      this.virtualNumpadSwitch = true;
    },
    updateRectNumber(num) {
      if (!this.validateSelectedRect()) return;

      const textID = this.configRect[this.isClickRectID].textID;
      this.currentInput += num.toString();
      this.configNumber[textID].text = this.currentInput;
      this.blankContent[this.isClickRectID] = this.currentInput;

      this.checkAnswer();
    },
    validateSelectedRect() {
      if (
        this.isClickRectID === undefined ||
        !this.configRect[this.isClickRectID]
      ) {
        console.error("無法更新，因為選中的方框 ID 無效");
        return false;
      }
      const textID = this.configRect[this.isClickRectID].textID;
      if (textID === undefined || !this.configNumber[textID]) {
        console.error("無法更新，因為 configNumber 中沒有相應的 textID");
        return false;
      }
      return true;
    },
    closeNumpad() {
      if (this.isClickRectID !== undefined) {
        this.blankContent[this.isClickRectID] = this.currentInput;
      }
      this.virtualNumpadSwitch = false;
      this.deselectAllRects();
      this.checkAnswer();
    },
    clearInput() {
      this.currentInput = "";
      if (this.isClickRectID !== undefined) {
        this.configNumber[this.configRect[this.isClickRectID].textID].text = "";
      }
    },
    checkAnswer() {
      const isCorrect = this.blankContent.every(
        (content, index) =>
          content.toString() === this.Data.blank_pos[index].toString()
      );
      this.$emit("replyAnswer", isCorrect);
    },
    deselectAllRects() {
      this.rectClickedList = this.rectClickedList.map(() => false);
    },
    numPadButtonClicked(buttonLabel) {
      switch (buttonLabel) {
        case "清除":
          this.clearInput();
          break;
        case "關閉":
          this.closeNumpad();
          break;
        default:
          this.updateRectNumber(buttonLabel);
      }
    },
  },
};
</script>
<style scoped lang="scss">
.gameContainer {
  width: 100%;
  height: 100%;
}
</style>
