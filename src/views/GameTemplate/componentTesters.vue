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
      <option selected>fillImages</option>
    </select>
  </div>
  <div v-if="tester === 'fraction'" class="testArea">
    <dragFraction
      :game-id="gameid"
      :component-config="configFraction"
      @reply-answer="printAns"
    />
  </div>
  <div v-if="tester === 'numberLine'" class="testArea">
    <numberLine
      :game-id="gameid"
      :component-config="configNumberLine"
      @get-drag-position="printAns"
    />
  </div>
  <div v-if="tester === 'drawShapes'" class="testArea">
    <drawShapes
      :game-id="gameid"
      :component-config="configDrawShapes"
      @reply-answer="printAns"
    />
  </div>
  <div v-if="tester === 'dragToAlign'" class="testArea">
    <dragToAlign :game-id="gameid" :component-config="configDragToAlign" />
  </div>
  <div v-if="tester === 'dragImages'" class="testArea">
    <dragImages :game-id="gameid" :component-config="configDragImages" />
  </div>
  <div v-if="tester === 'scale'" class="testArea">
    <scale
      :game-id="gameid"
      :component-config="configScale"
      @reply-answer="printAns"
    />
  </div>
  <div v-if="tester === 'drawingBoard'" class="testArea">
    <drawingBoard :component-config="configBrush"></drawingBoard>
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
  <div v-if="tester === 'fillImages'" class="testArea">
    <fillImages
      :key="testerKey"
      :game-id="'Dev02_Testers'"
      :component-config="configFillImages"
      @reply-answer="printAns"
    />
    <input
      type="number"
      min="1"
      max="49"
      @input="
        (e) => {
          configFillImages.frame = e.target.value;
          testerKey++;
        }
      "
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
export default {
  components: {
    dragFraction: defineAsyncComponent(
      () => import("@/components/DragFraction.vue")
    ),
    numberLine: defineAsyncComponent(
      () => import("@/components/DragOnNumberLine.vue")
    ),
    drawShapes: defineAsyncComponent(
      () => import("@/components/DrawShapes.vue")
    ),
    dragToAlign: defineAsyncComponent(
      () => import("@/components/DragToAlign.vue")
    ),
    dragImages: defineAsyncComponent(
      () => import("@/components/DragImages.vue")
    ),
    scale: defineAsyncComponent(() => import("@/components/ScalePointer.vue")),
    drawingBoard: defineAsyncComponent(
      () => import("@/components/DrawingBoard.vue")
    ),
    fillImages: defineAsyncComponent(
      () => import("@/components/FillImages.vue")
    ),
  },
  data() {
    return {
      tester: "fillImages",
      testerKey: 0,
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
            snapToGrid: true,
            rotatable: true,
          },
          {
            path: "apple.png",
            ratio: {
              width: 4,
              height: 2,
            },
            snapToGrid: true,
            rotatable: true,
          },
          {
            path: "sugar.png",
            ratio: {
              width: 2,
              height: 5,
            },
            snapToGrid: false,
            draggable: false,
            presetPosition: {
              x: 5,
              y: 7,
            },
          },
        ],
        backgroundType: "grid", //grid, color, image
        background: "gray", //15, "gray", "apple.png"
        backgroundRatio: {
          width: 15,
          height: 10,
        },
      },
      configScale: {
        answer: 100,
        //customScaleSrc: "sugar.png",
      },
      configBrush: {
        color: "red",
        size: 10,
      },
      configFillImages: {
        frame: 1,
        frameImage: "clover.png",
        fill: 1,
        fillImage: "cloverFull.png",
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
