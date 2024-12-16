<template>
  <div>
    <select @change="(event) => (tester = event.target.value)">
      <option>numberLine</option>
      <option>fraction</option>
      <option>drawShapes</option>
      <option>dragToAlign</option>
      <option>dragImages</option>
      <option>scale</option>
      <option>drawingBroad</option>
      <option selected>numPad</option>
    </select>
  </div>
  <div v-if="tester == 'fraction'" class="testArea">
    <dragFraction
      :Data="configFraction"
      :ID="gameid"
      @reply-answer="printAns"
    />
  </div>
  <div v-if="tester == 'numberLine'" class="testArea">
    <numberLine
      :Data="configNumberLine"
      :ID="gameid"
      @get-drag-position="printAns"
    />
  </div>
  <div v-if="tester == 'drawShapes'" class="testArea">
    <drawShapes
      :Data="configDrawShapes"
      :ID="gameid"
      @reply-answer="printAns"
    />
  </div>
  <div v-if="tester == 'dragToAlign'" class="testArea">
    <dragToAlign :Data="configDragToAlign" :ID="gameid" />
  </div>
  <div v-if="tester == 'dragImages'" class="testArea">
    <dragImages :Data="configDragImages" :ID="gameid" />
  </div>
  <div v-if="tester == 'scale'" class="testArea">
    <scale :Data="configScale" :ID="gameid" @replyAnswer="printAns" />
  </div>
  <div v-if="tester == 'drawingBoard'" class="testArea">
    <drawingBoard :Data="configBrush"></drawingBoard>
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
  <div v-if="tester == 'numPad'" class="numPad testArea">
    <numPad :Data="configNumPad" @replyAnswer="printAns"></numPad>
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
    drawingBoard: defineAsyncComponent(() =>
      import("@/components/DrawingBoard.vue")
    ),
    numPad: defineAsyncComponent(() =>
      import("@/components/ButtonWithNumPad.vue")
    ),
  },
  data() {
    return {
      tester: "numPad",
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
      configNumPad: {
        padPosition: "upperRight",
        color: "#6da1f1",
      },
      gameid: "Dev0105",
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
.testArea {
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
.numPad {
  width: 10%;
}
</style>
