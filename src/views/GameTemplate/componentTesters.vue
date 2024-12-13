<template>
  <div>
    <select @change="(event) => (tester = event.target.value)">
      <option>numberLine</option>
      <option>fraction</option>
      <option>drawShapes</option>
      <option>dragToAlign</option>
      <option>dragImages</option>
      <option>scale</option>
      <option selected>
        drawingBroad
      </option>
    </select>
  </div>
  <div v-if="tester == 'fraction'">
    <dragFraction
      :Data="configFraction"
      :ID="id"
      @reply-answer="printAns"
    />
  </div>
  <div v-if="tester == 'numberLine'">
    <numberLine
      :Data="configNumberLine"
      :ID="id"
      @get-drag-position="printAns"
    />
  </div>
  <div v-if="tester == 'drawShapes'">
    <drawShapes
      :Data="configDrawShapes"
      :ID="id"
      @reply-answer="printAns"
    />
  </div>
  <div v-if="tester == 'dragToAlign'">
    <dragToAlign :Data="configDragToAlign" :ID="id" />
  </div>
  <div v-if="tester == 'dragImages'">
    <dragImages :Data="configDragImages" :ID="id" />
  </div>
  <div v-if="tester == 'scale'">
    <scale :Data="configScale" :ID="id" @reply-answer="printAns" />
  </div>
  <div v-if="tester == 'drawingBroad'">
    <drawingBroad :Data="configBrush" />
    <div class="btnContainer">
      <button
        @click="
          configBrush.color = 'red';
          configBrush.size = 10;
        "
      >
        brush
      </button>
      <button
        @click="
          configBrush.color = 'eraser';
          configBrush.size = 50;
        "
      >
        eraser
      </button>
    </div>
  </div>
</template>

<script>
import { getGameAssets } from "@/utilitys/get_assets.js";
import * as canvasTools from "@/utilitys/canvasTools.js";
import { defineAsyncComponent } from "vue";
export default {
  components: {
    dragFraction: defineAsyncComponent(() =>
      import("@/components/DragFraction.vue")
    ),
    numberLine: defineAsyncComponent(() =>
      import("@/components/DragOnNumberLine.vue")
    ),
    drawShapes: defineAsyncComponent(() =>
      import("@/components/DrawShapes.vue")
    ),
    dragToAlign: defineAsyncComponent(() =>
      import("@/components/DragToAlign.vue")
    ),
    dragImages: defineAsyncComponent(() =>
      import("@/components/DragImages.vue")
    ),
    scale: defineAsyncComponent(() => import("@/components/Scale.vue")),
    drawingBroad: defineAsyncComponent(() =>
      import("@/components/DrawingBroad.vue")
    ),
  },
  data() {
    return {
      tester: "drawingBroad",
      configFraction: {
        verifyOption: "answer",
        shape: "circle",
        answer: {
          numerator: 1,
          denominator: 4,
        },
      },
      configNumberLine: {
        spacing: 1,
        max: 10,
        min: 2,
        init_pos: 5,
        image: "apple.png",
      },
      configDrawShapes: {
        bgRatio: {
          width: 20,
          height: 10,
        },
        /*givenPoints: [
          [2, 2],
          [2, 5],
        ],*/
        verifyOption: "rect", //none, rect, shape
        answer: [5, 3], //[5, 3], // triangle, rectangle, trapezium, parallelogram
      },
      configDragToAlign: {
        imageRatio: [5, 3],
        image: "apple.png",
      },
      configDragImages: {
        images: [
          {
            path: "apple.png",
            ratio: {
              width: 3,
              height: 3,
            },
          },
          {
            path: "sugar.png",
            ratio: {
              width: 2,
              height: 5,
            },
          },
        ],
        background: "black",
      },
      configScale: {
        answer: 100,
        //customScaleSrc: "sugar.png",
      },
      configBrush: {
        color: "red",
        size: 10,
      },
      id: "Dev0105",
    };
  },
  methods: {
    printAns(x) {
      console.log(x);
    },
  },
};
</script>

<style scoped lang="scss">
div {
  width: 70vw;
  height: 70vh;
}
.btnContainer {
  position: absolute;
  top: 20%;
  width: 0;
  height: 0;
  z-index: -1;
}
</style>
