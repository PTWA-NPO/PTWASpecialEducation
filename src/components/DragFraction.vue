<template>
  <div ref="container" class="gameContainer">
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect :config="configBG" />
        <v-rect :config="configSideBar" />
      </v-layer>
      <v-layer>
        <DragFractionItem
          ref="dragFractionItem"
          :key="componentKey"
          :game-width="gameWidth"
          :game-height="gameHeight"
          :numerator="numerator"
          :denominator="denominator"
          :shape="componentConfig.shape"
          :default-grid-on-top="componentConfig.defaultGridOnTop"
          :clear-trigger="clearTrigger"
          @add-fill="addFill"
        />
      </v-layer>
      <v-layer>
        <v-shape
          v-for="(arrow, index) in configArrow"
          :key="index"
          :config="arrow"
          @pointerdown="adjustNumber"
        />
        <v-text :config="configNumeratorOne" />
        <v-line :config="configNumeratorLine" />
        <v-text :config="configNumeratorNumber" />
        <v-text :config="configDenominatorNumber" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";
export default {
  components: {
    DragFractionItem: defineAsyncComponent(
      () => import("@/components/utilities/drag-fraction/DragFractionItem.vue")
    ),
  },

  props: {
    componentConfig: {
      type: Object,
      required: true,
    },
  },

  emits: ["replyAnswer", "recordAnswer"],
  data() {
    return {
      configKonva: {},
      configBG: {
        fill: "#DDF0FF",
        stroke: "#DDF0FF",
      },
      configSideBar: {
        fill: "#84919B",
        stroke: "#84919B",
      },

      gameWidth: 0,
      gameHeight: 0,

      configArrow: [],
      configNumeratorOne: {},
      configNumeratorLine: {},
      configNumeratorNumber: {},
      configDenominatorNumber: {},

      numerator: 3,
      denominator: 3,
      componentKey: 0,
      currentTotal: 0,
      clearTrigger: 0,

      arrowSpecs: [
        { x: 0.825, y: 0.4, operator: "numeratorMinus" },
        { x: 0.925, y: 0.4, operator: "numeratorPlus" },
        { x: 0.825, y: 0.85, operator: "denominatorMinus" },
        { x: 0.925, y: 0.85, operator: "denominatorPlus" },
      ],
    };
  },

  mounted() {
    this.initializeScene();
    this.componentKey++;
  },

  created() {
    emitter.on("submitAnswer", this.checkAnswerHandler);
  },

  beforeUnmount() {
    emitter.off("submitAnswer", this.checkAnswerHandler);
  },

  methods: {
    initializeScene() {
      // Use the actual container dimensions instead of a fixed 3:4 ratio
      this.gameWidth = this.$refs.container.clientWidth;
      this.gameHeight = this.$refs.container.clientHeight;

      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameHeight;
      this.configBG.width = this.gameWidth;
      this.configBG.height = this.gameHeight;
      this.configSideBar.width = this.gameWidth * 0.25;
      this.configSideBar.height = this.gameHeight;
      this.configSideBar.x = this.gameWidth * 0.75;
      this.drawArrow();
      this.drawNumber();
      this.drawAfterAdjusted(); // Init state
    },

    drawArrow() {
      const minDim = Math.min(this.gameWidth, this.gameHeight);
      this.configArrow = this.arrowSpecs.map((spec) => ({
        x: this.gameWidth * spec.x,
        y: this.gameHeight * spec.y,
        operator: spec.operator,
        stroke: "#BA3F38",
        fill: "#BA3F38",
        length: minDim * 0.05,
        sceneFunc: this.arrowSceneFunc,
        visible: !spec.operator.includes("denominator"),
      }));
    },

    arrowSceneFunc(context, shape) {
      const length = shape.getAttr("length");
      context.beginPath();
      context.moveTo(0, length * -0.5);
      context.lineTo(0, length * 0.5);
      if (shape.getAttr("operator").includes("Plus"))
        context.lineTo(length * 0.5 * Math.sqrt(3), 0);
      else if (shape.getAttr("operator").includes("Minus"))
        context.lineTo(length * -0.5 * Math.sqrt(3), 0);
      context.lineTo(0, length * -0.5);
      context.fillStrokeShape(shape);
      context.closePath();
    },

    drawNumber() {
      const minDim = Math.min(this.gameWidth, this.gameHeight);
      const fontSize = Math.max(minDim * 0.08, 30); // Prevent becoming too small

      this.configNumeratorOne = {
        x: this.gameWidth * 0.825,
        y: this.gameHeight * 0.4 - fontSize,
        text: `1`,
        fontSize,
        width: this.gameWidth * 0.1, // Full width between arrows
        align: "center",
      };

      this.configNumeratorLine = {
        x: this.gameWidth * 0.85,
        y: this.gameHeight * 0.4,
        points: [0, 0, this.gameWidth * 0.05, 0],
        stroke: "black",
        strokeWidth: Math.max(minDim * 0.005, 3), // Ensure line doesn't vanish
      };

      this.configNumeratorNumber = {
        x: this.gameWidth * 0.825,
        y: this.gameHeight * 0.4 + 5, // Just below the line
        text: this.numerator.toString(),
        fontSize,
        width: this.gameWidth * 0.1,
        align: "center",
      };

      this.configDenominatorNumber = {
        x: this.gameWidth * 0.825,
        y: this.gameHeight * 0.835,
        text: `${this.denominator}等分`,
        fontSize: Math.max(minDim * 0.04, 18),
        width: this.gameWidth * 0.1,
        align: "center",
        visible: false,
      };
    },

    adjustNumber(e) {
      const op = e.target.attrs.operator;
      if (op === "numeratorMinus" && this.numerator > 2) this.numerator--;
      else if (op === "numeratorPlus" && this.numerator < 12) this.numerator++;
      else if (op === "denominatorMinus" && this.denominator > 2)
        this.denominator--;
      else if (op === "denominatorPlus" && this.denominator < 12)
        this.denominator++;

      this.drawAfterAdjusted();
    },

    drawAfterAdjusted() {
      this.configNumeratorNumber.text = this.numerator.toString();
      this.configDenominatorNumber.text = `${this.denominator}等分`;

      const updateArrowColor = (idx, active) => {
        const color = active ? "#BA3F38" : "#505050";
        if (this.configArrow[idx]) {
          this.configArrow[idx].fill = color;
          this.configArrow[idx].stroke = color;
        }
      };

      // Arrows: 0=Num-, 1=Num+, 2=Den-, 3=Den+
      updateArrowColor(0, this.numerator > 2);
      updateArrowColor(1, this.numerator < 12);
      updateArrowColor(2, this.denominator > 2);
      updateArrowColor(3, this.denominator < 12);
    },

    addFill(fill) {
      let total = 0;
      for (const fraction in fill) {
        total += fill[fraction];
      }
      this.currentTotal = total;
      if (this.componentConfig.verifyOption === "answer") {
        const answer =
          this.componentConfig.answer.numerator /
          this.componentConfig.answer.denominator;
        const isCorrect = answer.toFixed(2) === total.toFixed(2);
        this.$emit("replyAnswer", isCorrect);
        this.$emit("recordAnswer", [
          answer.toFixed(2),
          total.toFixed(2),
          isCorrect ? "正確" : "錯誤",
        ]);
      } else if (this.componentConfig.verifyOption === "value") {
        this.$emit("replyAnswer", total.toFixed(2));
      }
    },

    checkAnswerHandler() {
      if (this.componentConfig.verifyOption === "answer") {
        const answer =
          this.componentConfig.answer.numerator /
          this.componentConfig.answer.denominator;
        const isCorrect = answer.toFixed(2) === this.currentTotal.toFixed(2);
        if (!isCorrect) {
          this.clearTrigger++;
        }
      }
    },
  },
};
</script>

<style scoped>
.gameContainer {
  width: 100%;
  height: 100%;
}
</style>
