<template>
  <div ref="container" class="gameContainer">
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect :config="configBG" />
        <v-rect :config="configSideBar" />
      </v-layer>
      <v-layer>
        <DragFractionItem
          :key="componentKey"
          :game-width="gameWidth"
          :game-height="gameHeight"
          :numerator="numerator"
          :denominator="denominator"
          :shape="componentConfig.shape"
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

      arrowSpecs: [
        { x: 0.825, y: 0.35, operator: "numeratorMinus" },
        { x: 0.925, y: 0.35, operator: "numeratorPlus" },
        { x: 0.825, y: 0.85, operator: "denominatorMinus" },
        { x: 0.925, y: 0.85, operator: "denominatorPlus" },
      ],
    };
  },

  mounted() {
    this.initializeScene();
    this.componentKey++;
  },

  methods: {
    initializeScene() {
      if (
        this.$refs.container.clientWidth * 0.75 <=
          this.$refs.container.clientHeight ||
        this.$refs.container.clientHeight === 0
      ) {
        this.gameWidth = this.$refs.container.clientWidth;
        this.gameHeight = this.gameWidth * 0.75;
      } else {
        this.gameHeight = this.$refs.container.clientHeight;
        this.gameWidth = this.gameHeight / 0.75;
      }
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
      this.configArrow = this.arrowSpecs.map((spec) => ({
        x: this.gameWidth * spec.x,
        y: this.gameHeight * spec.y,
        operator: spec.operator,
        stroke: "#BA3F38",
        fill: "#BA3F38",
        length: this.gameWidth * 0.05,
        sceneFunc: this.arrowSceneFunc,
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
      this.configNumeratorOne = {
        x: this.gameWidth * 0.86,
        y: this.gameHeight * 0.29,
        text: `1`,
        fontSize: this.gameWidth * 0.045,
      };

      this.configNumeratorLine = {
        x: this.gameWidth * 0.85,
        y: this.gameHeight * 0.345,
        points: [0, 0, this.gameWidth * 0.05, 0],
        stroke: "black",
        strokeWidth: 3,
      };

      this.configNumeratorNumber = {
        x: this.gameWidth * 0.86,
        y: this.gameHeight * 0.35,
        text: this.numerator,
        fontSize: this.gameWidth * 0.045,
      };

      this.configDenominatorNumber = {
        x: this.gameWidth * 0.83,
        y: this.gameHeight * 0.835,
        text: `${this.denominator}等分`,
        fontSize: this.gameWidth * 0.03,
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
      this.configNumeratorNumber.text = this.numerator;
      this.configNumeratorNumber.x =
        this.numerator >= 10 ? this.gameWidth * 0.85 : this.gameWidth * 0.86;
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
  },
};
</script>

<style scoped>
.gameContainer {
  width: 100%;
  height: 100%;
}
</style>
