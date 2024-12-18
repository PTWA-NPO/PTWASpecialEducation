<template>
  <div ref="container">
    <v-stage
      :config="configKonva"
      @pointerdown="drawNewLine"
      @pointermove="moveLine"
      @pointerup="stopDrawing"
    >
      <v-layer>
        <v-line
          v-for="(pointSet, index) in configGrid"
          :key="index"
          :points="pointSet"
          :stroke="'#aaa'"
        />
        <v-image :config="configReturnBtn" @pointerdown="deleteLine" />
      </v-layer>
      <v-layer>
        <v-line
          v-for="(line, index) in configLine"
          :key="index"
          :config="line"
          :stroke-width="5"
        />
        <v-circle
          v-for="(point, index) in configGivenPoint"
          :key="index"
          :config="point"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { getSystemAssets } from "@/utilitys/get_assets.js";
import * as canvasTools from "@/utilitys/canvasTools.js";
import { defineAsyncComponent } from "vue";
export default {
  components: {},

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
      ratio: {
        width: 15,
        height: 15,
      },
      gridPos: {
        x: [],
        y: [],
      },
      configGrid: [],
      configReturnBtn: {},
      configLine: [],
      configGivenPoint: [],

      drawing: false,
      currentPoint: {},
      sides: [],
    };
  },

  mounted() {
    this.getData();
    this.initializeScene();
    this.setGrid();
    this.drawGrid();
    this.drawReturnBtn();
    if (this.Data.givenPoints != null) {
      this.drawGiven();
    }
  },

  methods: {
    getData() {
      if (this.Data.bgRatio != null) {
        this.ratio = this.Data.bgRatio;
      }
    },
    initializeScene() {
      this.gameWidth = this.$refs.container.clientWidth;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height =
        (this.gameWidth * this.ratio.height) / this.ratio.width;
    },
    setGrid() {
      for (let i = 0; i <= this.ratio.width; ++i)
        this.gridPos.x.push((i * this.configKonva.width) / this.ratio.width);
      for (let i = 0; i <= this.ratio.height; ++i)
        this.gridPos.y.push((i * this.configKonva.height) / this.ratio.height);
    },
    drawGrid() {
      for (let i = 1; i < this.ratio.width; ++i) {
        this.configGrid.push([
          this.gridPos.x[i],
          0,
          this.gridPos.x[i],
          this.configKonva.height,
        ]);
      }
      for (let i = 1; i < this.ratio.height; ++i) {
        this.configGrid.push([
          0,
          this.gridPos.y[i],
          this.configKonva.width,
          this.gridPos.y[i],
        ]);
      }
    },
    drawReturnBtn() {
      const returnBtn = new window.Image();
      returnBtn.src = getSystemAssets("backArrow.png", "icon");
      this.configReturnBtn.image = returnBtn;
      this.configReturnBtn.x = this.gameWidth * 0.85;
      this.configReturnBtn.y = this.configKonva.height - this.gameWidth * 0.15;
      this.configReturnBtn.width = this.gameWidth * 0.15;
      this.configReturnBtn.height = this.gameWidth * 0.15;
    },
    drawGiven() {
      for (let point in this.Data.givenPoints) {
        this.configGivenPoint.push({
          x: this.gridPos.x[this.Data.givenPoints[point][0]],
          y: this.gridPos.y[this.Data.givenPoints[point][1]],
          radius: this.configKonva.width * 0.01,
          stroke: "brown",
          fill: "white",
        });
      }
      if (this.Data.givenPoints.length > 1) {
        for (let i = 0; i < this.Data.givenPoints.length - 1; ++i) {
          this.configLine.push({
            points: [
              this.configGivenPoint[i].x,
              this.configGivenPoint[i].y,
              this.configGivenPoint[i + 1].x,
              this.configGivenPoint[i + 1].y,
            ],
            stroke: "brown",
          });
        }
      }
    },
    drawNewLine(e) {
      this.drawing = true;

      this.currentPoint = this.getClosestPoint(
        e.target.getStage().getPointerPosition()
      );
      this.configLine.push({
        points: [
          this.gridPos.x[this.currentPoint.x],
          this.gridPos.y[this.currentPoint.y],
          e.target.getStage().getPointerPosition().x,
          e.target.getStage().getPointerPosition().y,
        ],
        stroke: "green",
      });
    },
    moveLine(e) {
      if (this.drawing) {
        let id = this.configLine.length - 1;
        this.configLine[id].points = [
          this.gridPos.x[this.currentPoint.x],
          this.gridPos.y[this.currentPoint.y],
          e.target.getStage().getPointerPosition().x,
          e.target.getStage().getPointerPosition().y,
        ];
      }
    },
    stopDrawing(e) {
      let id = this.configLine.length - 1;
      let pointerPoint = this.getClosestPoint(
        e.target.getStage().getPointerPosition()
      );
      this.drawing = false;
      this.configLine[id].points = [
        this.gridPos.x[this.currentPoint.x],
        this.gridPos.y[this.currentPoint.y],
        this.gridPos.x[pointerPoint.x],
        this.gridPos.y[pointerPoint.y],
      ];
      if (
        this.isSamePoint(
          this.getPointSetFromLine(id)[0],
          this.getPointSetFromLine(id)[1]
        )
      )
        this.configLine.splice(id, 1);
      this.verify();
    },

    getClosestPoint(pos) {
      let x, y;
      let distance = 999;
      for (let i = 0; i <= this.ratio.width; ++i) {
        if (Math.abs(pos.x - this.gridPos.x[i]) < distance) {
          x = i;
          distance = Math.abs(pos.x - this.gridPos.x[i]);
        }
      }
      distance = 999;
      for (let i = 0; i <= this.ratio.height; ++i) {
        if (Math.abs(pos.y - this.gridPos.y[i]) < distance) {
          y = i;
          distance = Math.abs(pos.y - this.gridPos.y[i]);
        }
      }
      return { x: x, y: y };
    },
    slope(id) {
      let pointSet = this.getPointSetFromLine(id);
      if (pointSet[0].x == pointSet[1].x) return "vertical";
      else
        return (
          (pointSet[0].y - pointSet[1].y) /
          (pointSet[0].x - pointSet[1].x)
        ).toFixed(2);
    },
    isParallel(id1, id2) {
      if (this.slope(id1) == this.slope(id2)) return true;
      else return false;
    },
    isPerpendicular(id1, id2) {
      if (this.slope(id1) == "vertical" || this.slope(id2) == "vertical") {
        if (this.slope(id1) == 0 || this.slope(id2) == 0) return true;
        else return false;
      } else if (this.slope(id1) * this.slope(id2) == -1) return true;
      else return false;
    },
    isLinked(id1, id2) {
      let pointSet1 = this.getPointSetFromLine(id1),
        pointSet2 = this.getPointSetFromLine(id2);
      if (this.isSameLine(id1, id2) || id1 == id2) return false;
      else if (
        this.isSamePoint(pointSet1[0], pointSet2[0]) ||
        this.isSamePoint(pointSet1[0], pointSet2[1]) ||
        this.isSamePoint(pointSet1[1], pointSet2[1]) ||
        this.isSamePoint(pointSet1[1], pointSet2[0])
      ) {
        return true;
      } else return false;
    },
    findLinks(id) {
      let links = [];
      for (let line in this.configLine) {
        if (this.isLinked(id, line)) {
          links.push(line);
        }
      }
      return links;
    },
    isLinkedByLines(id1, id2) {
      if (id1 == id2) return false;
      let linkingLines = [];
      for (let link1 in this.findLinks(id1)) {
        for (let link2 in this.findLinks(id2)) {
          if (this.findLinks(id1)[link1] == this.findLinks(id2)[link2]) {
            linkingLines.push(this.findLinks(id1)[link1]);
            if (linkingLines.length == 2) {
              return linkingLines;
            }
          }
        }
      }
      return false;
    },
    getPointSetFromLine(id) {
      return [
        {
          x: this.configLine[id].points[0],
          y: this.configLine[id].points[1],
        },
        {
          x: this.configLine[id].points[2],
          y: this.configLine[id].points[3],
        },
      ];
    },
    lengthInGrid(id) {
      let pointOnGrid1 = this.getClosestPoint(this.getPointSetFromLine(id)[0]);
      let pointOnGrid2 = this.getClosestPoint(this.getPointSetFromLine(id)[1]);
      return Math.abs(
        pointOnGrid1.x + pointOnGrid1.y - pointOnGrid2.x - pointOnGrid2.y
      );
    },
    isSamePoint(point1, point2) {
      if (point1.x == point2.x && point1.y == point2.y) return true;
      else return false;
    },
    isSameLine(id1, id2) {
      let pointSet1 = this.getPointSetFromLine(id1),
        pointSet2 = this.getPointSetFromLine(id2);
      if (
        (this.isSamePoint(pointSet1[0], pointSet2[0]) &&
          this.isSamePoint(pointSet1[1], pointSet2[1])) ||
        (this.isSamePoint(pointSet1[0], pointSet2[1]) &&
          this.isSamePoint(pointSet1[1], pointSet2[0]))
      )
        return true;
      else return false;
    },
    isIntersected() {
      for (let i in this.configLine) {
        let pointSet1 = this.getPointSetFromLine(i);
        for (let j in this.configLine) {
          if (j < i || this.isSameLine(i, j)) continue;
          let pointSet2 = this.getPointSetFromLine(j);
          if (
            this.cross(
              this.vector(pointSet1[0], pointSet2[1]),
              this.vector(pointSet2[0], pointSet2[1])
            ) *
              this.cross(
                this.vector(pointSet1[1], pointSet2[1]),
                this.vector(pointSet2[0], pointSet2[1])
              ) <
              0 &&
            this.cross(
              this.vector(pointSet2[0], pointSet1[1]),
              this.vector(pointSet1[0], pointSet1[1])
            ) *
              this.cross(
                this.vector(pointSet2[1], pointSet1[1]),
                this.vector(pointSet1[0], pointSet1[1])
              ) <
              0
          ) {
            return true;
          }
        }
      }
      return false;
    },
    vector(point1, point2) {
      return { x: point1.x - point2.x, y: point1.y - point2.y };
    },
    cross(vector1, vector2) {
      return vector1.x * vector2.y - vector1.y * vector2.x;
    },
    isTriangle() {
      this.sides = [];
      for (let line in this.configLine) {
        if (this.findLinks(line).length >= 2) {
          this.sides.push(line);
          for (let i in this.findLinks(line)) {
            for (let j in this.findLinks(line)) {
              if (
                this.isLinked(this.findLinks(line)[i], this.findLinks(line)[j])
              ) {
                this.sides = [
                  line,
                  this.findLinks(line)[i],
                  this.findLinks(line)[j],
                ];
                return true;
              }
            }
          }
        }
      }
      return false;
    },
    isQuadrilateral() {
      for (let i in this.configLine) {
        for (let j in this.configLine) {
          if (this.isLinkedByLines(i, j)) {
            this.sides = [
              i,
              this.isLinkedByLines(i, j)[0],
              j,
              this.isLinkedByLines(i, j)[1],
            ];
            return true;
          }
        }
      }
      return false;
    },
    isTrapezium() {
      if (this.isQuadrilateral()) {
        if (
          (this.isParallel(this.sides[0], this.sides[2]) &&
            !this.isParallel(this.sides[1], this.sides[3])) ||
          (!this.isParallel(this.sides[0], this.sides[2]) &&
            this.isParallel(this.sides[1], this.sides[3]))
        ) {
          return true;
        }
      }
      return false;
    },
    isParallelogram() {
      if (this.isQuadrilateral()) {
        if (
          this.isParallel(this.sides[0], this.sides[2]) &&
          this.isParallel(this.sides[1], this.sides[3])
        ) {
          return true;
        }
      }
      return false;
    },
    isRectangle() {
      if (this.isParallelogram()) {
        if (this.isPerpendicular(this.sides[0], this.sides[1])) {
          return true;
        }
      }
      return false;
    },
    deleteLine() {
      if (this.configLine.length == 0) return;
      let id = this.configLine.length - 1;
      if (this.configLine[id].stroke != "brown") {
        this.configLine.splice(id, 1);
      }
    },
    verify() {
      if (this.isIntersected()) {
        this.$emit("replyAnswer", false);
        return;
      } else if (this.Data.verifyOption == "shape") {
        switch (this.Data.answer) {
          case "triangle":
            this.$emit("replyAnswer", this.isTriangle());
            break;
          case "rectangle":
            this.$emit("replyAnswer", this.isRectangle());
            break;
          case "trapezium":
            this.$emit("replyAnswer", this.isTrapezium());
            break;
          case "parallelogram":
            this.$emit("replyAnswer", this.isParallelogram());
            break;
        }
      } else if (this.Data.verifyOption == "rect") this.verifyRectangle();
    },
    verifyRectangle() {
      if (this.isRectangle()) {
        let height = this.lengthInGrid(this.sides[0]),
          width = this.lengthInGrid(this.sides[1]);
        if (
          (this.Data.answer[0] == height && this.Data.answer[1] == width) ||
          (this.Data.answer[0] == width && this.Data.answer[1] == height)
        ) {
          this.$emit("replyAnswer", true);
          return;
        }
      }
      this.$emit("replyAnswer", false);
    },
  },
};
</script>
