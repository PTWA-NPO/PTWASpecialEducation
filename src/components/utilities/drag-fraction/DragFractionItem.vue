<template>
  <bin
    :config="configBin"
    @get-bin-pos="
      (e) => {
        binPosition = e;
      }
    "
  />

  <!-- Circle Mode Elements -->
  <template v-if="shape === 'circle'">
    <v-circle
      v-for="(frame, index) in configDenominator.frame"
      :key="`c-frame-${index}`"
      :config="frame"
      @dragmove="denominatorDragMove"
      @dragend="denominatorDragEnd"
    />
    <v-shape
      v-for="(circle, index) in configDenominator.fillShape"
      :key="`c-fill-${index}`"
      :config="circle"
      @dragmove="denominatorDragMove"
      @dragend="denominatorDragEnd"
      @click="removeValue(index)"
      @tap="removeValue(index)"
    />
  </template>

  <!-- Rect Mode Elements -->
  <template v-if="shape === 'rect'">
    <v-rect
      v-for="(frame, index) in configDenominator.frame"
      :key="`r-frame-${index}`"
      :config="frame"
      @dragmove="denominatorDragMove"
      @dragend="denominatorDragEnd"
    />
    <v-rect
      v-for="(rect, index) in configDenominator.fillShape"
      :key="`r-fill-${index}`"
      :config="rect"
      @dragmove="denominatorDragMove"
      @dragend="denominatorDragEnd"
      @click="removeValue(index)"
      @tap="removeValue(index)"
    />
  </template>

  <!-- Common Slice (Shape) -->
  <v-shape
    v-for="(slice, index) in configDenominator.slice"
    :key="`slice-${index}`"
    :config="slice"
    :listening="false"
  />

  <!-- Numerator (Circle or Rect) -->
  <v-shape
    v-if="shape === 'circle'"
    :config="configNumerator"
    @dragend="numeratorDragEnd"
  />
  <v-rect v-else :config="configNumerator" @dragend="numeratorDragEnd" />
</template>

<script>
import * as canvasTools from "@/lib/canvasTools.js";
import { defineAsyncComponent } from "vue";

export default {
  components: {
    bin: defineAsyncComponent(() => import("@/components/interactiveBin.vue")),
  },

  props: {
    numerator: { type: Number, required: true },
    denominator: { type: Number, required: true },
    gameWidth: { type: Number, required: true },
    gameHeight: { type: Number, required: true },
    shape: {
      type: String,
      required: true,
      validator: (v) => ["circle", "rect"].includes(v),
    },
  },

  emits: ["addFill"],

  data() {
    return {
      numeratorSnapTo: {},
      denominatorSnapTo: {},
      boundaries: {},
      // Circle specific
      radius: 0,
      // Rect specific
      rectAttr: { width: 0, height: 0 },

      configNumerator: {
        draggable: true,
        fill: "#4C5B3A",
        stroke: "#4C5B3A",
      },
      configDenominator: {
        frame: [],
        fillShape: [], // Unified name for 'circle' or 'rect' list in config
        slice: [],
      },
      configBin: {
        open: false,
        x: 0,
        y: 0,
        width: 0,
      },
      binPosition: {},
      fill: [],
    };
  },

  beforeMount() {
    this.setAttributes();
    this.initialize();
  },

  mounted() {
    this.intervalId = window.setInterval(this.update, 20);
  },

  beforeUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
  },

  methods: {
    setAttributes() {
      if (this.shape === "circle") {
        this.radius = this.gameWidth * 0.075;
        this.numeratorSnapTo = {
          x: this.gameWidth * 0.875,
          y: this.gameHeight * 0.2,
        };
        this.denominatorSnapTo = {
          x: this.gameWidth * 0.875,
          y: this.gameHeight * 0.7,
        };
        this.boundaries = {
          up: this.radius,
          down: this.gameHeight - this.radius,
          left: this.radius,
          right: this.gameWidth * 0.75 - this.radius,
        };
      } else {
        this.rectAttr = {
          width: this.gameWidth * 0.2,
          height: this.gameHeight * 0.15,
        };
        this.numeratorSnapTo = canvasTools.corner({
          x: this.gameWidth * 0.875,
          y: this.gameHeight * 0.2,
          width: this.rectAttr.width,
          height: this.rectAttr.height,
        });
        this.denominatorSnapTo = canvasTools.corner({
          x: this.gameWidth * 0.875,
          y: this.gameHeight * 0.7,
          width: this.rectAttr.width,
          height: this.rectAttr.height,
        });
        this.boundaries = {
          up: 0,
          down: this.gameHeight - this.rectAttr.height,
          left: 0,
          right: this.gameWidth * 0.75 - this.rectAttr.width,
        };
      }
    },

    initialize() {
      this.drawNumerator();
      this.drawDenominator();
      this.drawBin();
    },

    update() {
      if (this.shape === "circle") {
        // Circle Animation
        this.configNumerator.endRadians = this.animateValue(
          this.configNumerator.endRadians,
          (Math.PI * 2) / this.numerator,
          0.02
        );
        for (let i = 0; i < this.fill.length; ++i) {
          if (this.configDenominator.fillShape[i]) {
            this.configDenominator.fillShape[i].endRadians = this.animateValue(
              this.configDenominator.fillShape[i].endRadians,
              Math.PI * 2 * this.fill[i],
              0.02
            );
          }
        }
      } else {
        // Rect Animation
        this.configNumerator.width = this.animateValue(
          this.configNumerator.width,
          this.rectAttr.width / this.numerator,
          1
        );
        for (let i = 0; i < this.fill.length; ++i) {
          if (this.configDenominator.fillShape[i]) {
            this.configDenominator.fillShape[i].width = this.animateValue(
              this.configDenominator.fillShape[i].width,
              this.rectAttr.width * this.fill[i],
              1
            );
          }
        }
      }

      // Slice update (common logic structure, though property access might differ slightly if we didn't unify slices)
      // Actually slices logic was: if (configDenominator.slice[i-1].slices !== denominator) ...
      // But 'i' is from the loop. The original code had `let i; for (...) {} if (...)`. This is risky if fill is empty or i is out of scope.
      // JS `var` or `let` outside loop works.
      // However, it seems to update the *last* created slice or something?
      // Original code check:
      /*
         let i;
         for (i = 0; i < this.fill.length; ++i) { ... }
         if (this.configDenominator.slice[i - 1].slices !== this.denominator) ...
      */
      // This updates the most recently pushed slice's slices count if it changed?
      // But `fill.length` is consistent with `slice.length`. `i` after loop is length. `i-1` is last index.
      if (this.fill.length > 0) {
        const lastIdx = this.fill.length - 1;
        if (
          this.configDenominator.slice[lastIdx] &&
          this.configDenominator.slice[lastIdx].slices !== this.denominator
        ) {
          this.configDenominator.slice[lastIdx].slices = this.denominator;
        }
      }
    },

    animateValue(current, target, step) {
      if (Math.abs(current - target) < step) {
        return target;
      }
      return current < target ? current + step : current - step;
    },

    drawNumerator() {
      this.configNumerator.x = this.numeratorSnapTo.x;
      this.configNumerator.y = this.numeratorSnapTo.y;

      if (this.shape === "circle") {
        this.configNumerator.radius = this.radius;
        this.configNumerator.startRadians = 0;
        // Keep endRadians if it exists for animation continuity, else init
        if (this.configNumerator.endRadians === undefined)
          this.configNumerator.endRadians = (Math.PI * 2) / this.numerator;
        this.configNumerator.sceneFunc = this.circleSceneFunc;
      } else {
        // Rect
        if (this.configNumerator.width === undefined)
          this.configNumerator.width = this.rectAttr.width / this.numerator;
        this.configNumerator.height = this.rectAttr.height;
      }
    },

    drawDenominator() {
      const idx = this.fill.length;
      const commonProps = {
        x: this.denominatorSnapTo.x,
        y: this.denominatorSnapTo.y,
        name: idx.toString(),
      };

      // Frame
      let frame = {
        ...commonProps,
        fill: "white",
        stroke: "white",
        draggable: true,
      };

      // Fill Shape (Circle/Rect)
      let fillShape = {
        ...commonProps,
        strokeEnabled: false,
        visible: false,
        fill: "#4C5B3A",
        draggable: true,
      };

      // Slice
      let slice = {
        ...commonProps,
        stroke: "black",
        sceneFunc:
          this.shape === "circle"
            ? this.circleSliceSceneFunc
            : this.rectSliceSceneFunc,
        slices: this.denominator,
      };

      if (this.shape === "circle") {
        frame.radius = this.radius;

        fillShape.radius = this.radius;
        fillShape.startRadians = 0;
        fillShape.endRadians = 0;
        fillShape.sceneFunc = this.circleSceneFunc;

        slice.radius = this.radius;
      } else {
        frame.width = this.rectAttr.width;
        frame.height = this.rectAttr.height;

        fillShape.width = 0;
        fillShape.height = this.rectAttr.height;

        slice.width = this.rectAttr.width;
        slice.height = this.rectAttr.height;
      }

      this.configDenominator.frame.push(frame);
      this.configDenominator.fillShape.push(fillShape);
      this.configDenominator.slice.push(slice);
      this.fill.push(0);
    },

    drawBin() {
      this.configBin.x = this.gameWidth * 0.01;
      this.configBin.y = this.gameHeight * 0.8;
      this.configBin.width = this.gameWidth * 0.15;
    },

    // Scene Functions
    circleSceneFunc(context, shape) {
      context.beginPath();
      context.moveTo(0, 0);
      context.rotate(Math.PI * -0.5);
      context.arc(
        0,
        0,
        shape.getAttr("radius"),
        shape.getAttr("startRadians"),
        shape.getAttr("endRadians")
      );
      context.lineTo(0, 0);
      context.fillStrokeShape(shape);
      context.closePath();
    },

    circleSliceSceneFunc(context, shape) {
      context.beginPath();
      context.setLineDash([5, 5]);
      for (let i = 0; i < shape.getAttr("slices"); ++i) {
        context.moveTo(0, 0);
        context.lineTo(0, -shape.getAttr("radius"));
        context.moveTo(0, 0);
        context.rotate((Math.PI * 2) / shape.getAttr("slices"));
      }
      context.stroke();
      context.closePath();
    },

    rectSliceSceneFunc(context, shape) {
      context.beginPath();
      context.setLineDash([5, 5]);
      const sliceWidth = shape.getAttr("width") / shape.getAttr("slices");
      for (let i = 1; i < shape.getAttr("slices"); ++i) {
        context.moveTo(sliceWidth * i, 0);
        context.lineTo(sliceWidth * i, shape.getAttr("height"));
      }
      context.stroke();
      context.closePath();
    },

    // Interaction Handlers
    getShapeCenter(node) {
      if (this.shape === "circle") {
        return node.position();
      } else {
        return canvasTools.center(node.attrs);
      }
    },

    denominatorDragMove(e) {
      const id = e.target.attrs.name;
      const fillShape = this.configDenominator.fillShape[id];

      if (fillShape && fillShape.visible) {
        e.target.x(Math.max(e.target.x(), this.boundaries.left));
        e.target.x(Math.min(e.target.x(), this.boundaries.right));
        e.target.y(Math.max(e.target.y(), this.boundaries.up));
        e.target.y(Math.min(e.target.y(), this.boundaries.down));
      }

      // Sync all parts
      const x = e.target.x();
      const y = e.target.y();

      if (this.configDenominator.frame[id]) {
        this.configDenominator.frame[id].x = x;
        this.configDenominator.frame[id].y = y;
      }
      if (this.configDenominator.fillShape[id]) {
        this.configDenominator.fillShape[id].x = x;
        this.configDenominator.fillShape[id].y = y;
      }
      if (this.configDenominator.slice[id]) {
        this.configDenominator.slice[id].x = x;
        this.configDenominator.slice[id].y = y;
      }

      // Bin collision
      const centerPos = this.getShapeCenter(e.target);
      if (
        canvasTools.distance(centerPos, this.binPosition) <
        this.gameWidth * 0.05
      ) {
        this.configBin.open = true;
      } else {
        this.configBin.open = false;
      }
    },

    denominatorDragEnd(e) {
      const id = e.target.attrs.name;
      const fillShape = this.configDenominator.fillShape[id];

      if (fillShape && !fillShape.visible) {
        // Use center check for rect? Original code used position for Circle, center for Rect.
        // Actually original Circle used: canvasTools.isInBound(e.target.position(), this.boundaries)
        // Original Rect used: canvasTools.isInBound(e.target.position(), this.boundaries) -> Wait, let me check.
        // Rect: isInBound(e.target.position(), boundaries) -- SAME. position is top-left.
        // So checking if top-left is in bound works if boundaries are set up for top-left.

        if (canvasTools.isInBound(e.target.position(), this.boundaries)) {
          this.drawDenominator();
          fillShape.visible = true;
        } else {
          e.target.position(this.denominatorSnapTo);
          // Sync parts back to snap
          this.syncPartsToSnap(id);
        }
      }

      const centerPos = this.getShapeCenter(e.target);
      if (
        canvasTools.distance(centerPos, this.binPosition) <
        this.gameWidth * 0.05
      ) {
        this.configBin.open = false;
        this.destroy(id);
      }
    },

    numeratorDragEnd(e) {
      for (let i = 0; i < this.fill.length; ++i) {
        const fillShape = this.configDenominator.fillShape[i];
        if (!fillShape) continue;

        if (fillShape.visible) {
          if (this.shape === "circle") {
            // Circle collision: distance <= radius
            // shape is center-based
            if (
              canvasTools.distance(e.target.position(), fillShape) <=
              this.radius
            ) {
              this.addValue(i);
              break;
            }
          } else {
            // Rect collision: center inside rect bounds
            // Rects are top-left based.
            const range = {
              up: fillShape.y,
              down: fillShape.y + this.rectAttr.height,
              left: fillShape.x,
              right: fillShape.x + this.rectAttr.width,
            };
            // Numerator is also rect.
            if (
              canvasTools.isInBound(canvasTools.center(e.target.attrs), range)
            ) {
              this.addValue(i);
              break;
            }
          }
        }
      }

      e.target.x(this.numeratorSnapTo.x);
      e.target.y(this.numeratorSnapTo.y);
    },

    addValue(index) {
      if (this.fill[index] + 1 / this.numerator <= 1.01) {
        // 1.01 for float tolerance? Original was <= 1.
        // Original: if (this.fill[i] + 1 / this.numerator <= 1)
        this.fill[index] += 1 / this.numerator;
        this.$emit("addFill", this.fill);
      }
    },

    removeValue(index) {
      if (this.fill[index] - 1 / this.numerator >= -0.01) {
        this.fill[index] -= 1 / this.numerator;
        if (this.fill[index] < 0) this.fill[index] = 0;
        this.$emit("addFill", this.fill);
      }
    },

    syncPartsToSnap(id) {
      // Helper to reset pos
      const x = this.denominatorSnapTo.x;
      const y = this.denominatorSnapTo.y;
      this.configDenominator.slice[id].x = x;
      this.configDenominator.slice[id].y = y;
      // ... other parts
    },

    destroy(id) {
      this.configDenominator.frame[id] = null;
      this.configDenominator.fillShape[id] = null;
      this.configDenominator.slice[id] = null;
      this.fill[id] = 0;
      this.$emit("addFill", this.fill);
    },
  },
};
</script>
