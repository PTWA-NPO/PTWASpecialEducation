<template>
  <div class="OutterContainer container">
    <div class="title">
      <a>{{ gameData.Question }}</a>
    </div>
    <div class="game-area">
      <div ref="stageContainer" class="main-stage">
        <v-stage
          ref="stage"
          :config="stageConfig"
          @pointermove="Drawing"
          @pointerup="EndDrawing"
        >
          <!-- Bottom Layer: NumberSeries & Main Background -->
          <v-layer ref="RectContainer">
            <v-image v-if="ImageConfig" :config="ImageConfig" />
            <v-group
              v-for="(item, index) in seriesRects"
              :key="'s-rect-' + index"
              :config="{ x: item.x, y: item.y }"
            >
              <v-image
                v-if="item.image"
                :config="{
                  image: item.image,
                  width: item.width,
                  height: item.height,
                  opacity: item.isBlank ? 0.6 : 1,
                }"
              />
              <v-rect
                v-else
                :config="{
                  width: item.width,
                  height: item.height,
                  cornerRadius: item.cornerRadius,
                  fill: item.fill,
                  stroke: item.stroke,
                  strokeWidth: item.strokeWidth,
                  dash: item.dash,
                }"
              />
            </v-group>
            <v-text
              v-for="(item, index) in seriesTexts"
              :key="'s-text-' + index"
              :config="item"
            />
            <!-- Dots -->
            <v-circle
              v-for="(item, index) in ImageMountPoint"
              :key="'mount-point-' + index"
              :config="item"
            />
          </v-layer>
          <!-- Middle Layer: Lines -->
          <v-layer ref="LineLayer">
            <v-line v-for="line in lines" :key="line.id" :config="line" />
          </v-layer>
          <!-- Top Layer: Answer Selections -->
          <v-layer ref="layer">
            <v-rect
              v-for="(item, index) in rects"
              :key="'sel-rect-' + index"
              :config="item"
              @pointerdown="StartDrawing(index)"
            />
            <v-text
              v-for="(item, index) in Texts"
              :key="'text-' + index"
              :config="item"
              @pointerdown="StartDrawing(index)"
            />
            <v-group
              v-for="(item, index) in FractionTexts"
              :key="`fraction-${index}`"
              :config="{ x: item.x, y: item.y }"
              @pointerdown="StartDrawing(item.rectIndex)"
            >
              <KonvaFractionText
                :numerator="item.numerator"
                :denominator="item.denominator"
                :x="0"
                :y="0"
                :font-size="item.fontSize"
                :color="item.color"
                :align="item.align"
              />
            </v-group>
          </v-layer>
        </v-stage>
      </div>
    </div>
  </div>
</template>

<script>
import { getGameAssets, getGameStaticAssets } from "@/lib/get-assets.js";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";
import KonvaFractionText from "@/components/KonvaFractionText.vue";

export default {
  name: "LinktoImageGame",
  components: {
    KonvaFractionText,
  },
  props: {
    gameData: {
      type: Object,
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    },
  },
  emits: ["play-effect", "add-record", "next-question"],
  data() {
    return {
      bgImageObj: null,
      stageConfig: {
        width: 700,
        height: 500,
      },
      rects: [],
      lines: [], // 取代 Lines
      currentLineId: null, // 取代 currentLine 直接存物件
      linksByRect: new Map(), // rectIndex -> lineId
      linksByPoint: new Map(), // pointIndex -> lineId
      Texts: [],
      FractionTexts: [],
      seriesRects: [],
      seriesTexts: [],
      numberSeriesItems: [],
      localSelections: [],
      localMountPoints: [],
      ImageConfig: null,
      ImageMountPoint: [],
      MinGap: 10,
      Pair: [],
      FontSize: 20,
      SelectionHeight: 50,
      RectCornerRaduis: 15,
      randomColorlist: [
        "F6BD60",
        "F7EDE2",
        "F5CAC3",
        "84A59D",
        "F28482",
        "F5CAC3",
        "F7EDE2",
        "F6BD60",
        "84A59D",
        "F28482",
      ],
    };
  },
  created() {
    this.setupData();
    this.bgImageObj = new window.Image();

    const bgSrc = this.gameData.BGSrc;
    if (bgSrc) {
      this.bgImageObj.src = getGameAssets(this.gameId, bgSrc);
    } else if (
      this.gameData.NumberSeries &&
      this.gameData.NumberSeries.length > 0
    ) {
      // 若為數列題且沒有設定 BGSrc, 則隨機使用系統預設的 bg1~bg4.png 作為格子背景
      const randomBg = `bg${Math.floor(Math.random() * 4) + 1}.png`;
      this.bgImageObj.src = getGameStaticAssets("linkto-image", randomBg);
    }

    if (this.bgImageObj.src) {
      // 當圖片載入完成後進行版面配置
      this.bgImageObj.onload = () => {
        this.renderLayout();
      };
    } else {
      this.renderLayout();
    }

    emitter.on("submitAnswer", this.CheckAllAnswer);
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);

    const layer = this.$refs.layer.getNode();
    layer.moveToTop();
    layer.draw();

    const lineLayer = this.$refs.LineLayer.getNode();
    lineLayer.draw();

    const RectContainer = this.$refs.RectContainer.getNode();
    RectContainer.moveToBottom();
    RectContainer.draw();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    emitter.off("submitAnswer", this.CheckAllAnswer);
  },
  methods: {
    handleResize() {
      // 視窗改變時，重新計算所有比例
      this.renderLayout();
    },
    renderLayout() {
      if (!this.$refs.stageContainer) return;

      let containerWidth = this.$refs.stageContainer.offsetWidth;
      let containerHeight = this.$refs.stageContainer.offsetHeight;

      // 防呆：如果父容器被隱藏或尚未撐開，給個預設寬高
      if (containerWidth < 100) containerWidth = window.innerWidth * 0.9;
      if (containerHeight < 100) containerHeight = window.innerHeight - 150;

      this.stageConfig.width = containerWidth;
      this.stageConfig.height = containerHeight;

      const hasImage = this.bgImageObj && this.bgImageObj.width > 0;
      if (
        !hasImage &&
        !(this.gameData.NumberSeries && this.gameData.NumberSeries.length > 0)
      )
        return;

      // 清除舊物件與連線（因為畫布大小變更，舊有座標已不適用）
      this.rects = [];
      this.Texts = [];
      this.FractionTexts = [];
      this.seriesRects = [];
      this.seriesTexts = [];
      this.ImageMountPoint = [];
      this.lines = [];
      this.linksByRect.clear();
      this.linksByPoint.clear();
      this.currentLineId = null;
      this.localMountPoints = [];

      // 計算 seriesRects 如果有的話
      if (this.numberSeriesItems && this.numberSeriesItems.length > 0) {
        const seriesLength = this.numberSeriesItems.length;
        const cellWidth = Math.min(
          (containerWidth - (seriesLength + 1) * this.MinGap) / seriesLength,
          150
        );
        const cellHeight = 80;
        const totalBlockWidth =
          seriesLength * cellWidth + (seriesLength - 1) * this.MinGap;
        const startX = (containerWidth - totalBlockWidth) / 2;
        const startY = (containerHeight - cellHeight) / 2;

        this.numberSeriesItems.forEach((item, index) => {
          const x = startX + index * (cellWidth + this.MinGap);
          const y = startY;

          const rectConfig = {
            x,
            y,
            width: cellWidth,
            height: cellHeight,
            cornerRadius: this.RectCornerRaduis,
            fill: item.isBlank
              ? "transparent"
              : hasImage
                ? "transparent"
                : this.randomColor(),
            stroke: item.isBlank
              ? "#9CA3AF"
              : hasImage
                ? "transparent"
                : "#4B5563",
            strokeWidth: 2,
            dash: item.isBlank ? [5, 5] : [],
            image: hasImage ? this.bgImageObj : null,
          };
          this.seriesRects.push(rectConfig);

          if (item.isBlank) {
            this.localMountPoints.push({
              x: x + cellWidth / 2,
              y: y + cellHeight / 2,
              Connect2: item.value,
              isAbsolute: true,
            });
          } else {
            const fractionData = this.parseLatexFraction(item.value);
            if (fractionData) {
              this.FractionTexts.push({
                x: x + cellWidth / 2,
                y: y + cellHeight / 2 - 10,
                numerator: fractionData.numerator,
                denominator: fractionData.denominator,
                fontSize: Math.max(this.FontSize - 4, 12),
                color: "#111827",
                align: "center",
                rectIndex: -1,
              });
            } else {
              this.seriesTexts.push({
                x,
                y: y + (cellHeight - this.FontSize) / 2,
                width: cellWidth,
                text: item.value,
                fontSize: this.FontSize,
                align: "center",
                fill: "#111827",
              });
            }
          }
        });
      } else {
        this.localMountPoints = this.gameData.MountPoint || [];
      }

      // 重新依據新寬高排列頭尾的選項
      this.configRect(containerWidth, containerHeight);

      // 計算扣除上下選項後，圖片能顯示的中心範圍
      const StageHeight = containerHeight - this.SelectionHeight * 2;
      let NewImageWidth = 100,
        NewImageHeight = 100,
        NewX = 0,
        NewY = 0,
        scaleFactor = 1;

      if (hasImage) {
        const imgWidth = this.bgImageObj.width;
        const imgHeight = this.bgImageObj.height;
        const ration = imgWidth / imgHeight;

        if (containerWidth / StageHeight > ration) {
          NewImageHeight = Math.max(StageHeight - 30, 100);
          NewImageWidth = NewImageHeight * ration;
        } else {
          NewImageWidth = Math.max(containerWidth - 30, 100);
          NewImageHeight = NewImageWidth / ration;
        }

        NewX = (containerWidth - NewImageWidth) / 2;
        NewY = (StageHeight - NewImageHeight) / 2;

        this.ImageConfig = {
          image: this.bgImageObj,
          width: NewImageWidth,
          height: NewImageHeight,
          x: NewX,
          y: NewY + this.SelectionHeight,
        };

        // 計算題目的目標點坐標縮放
        if (
          hasImage &&
          !(this.gameData.NumberSeries && this.gameData.NumberSeries.length > 0)
        ) {
          // (假設企劃當初是在 700x500 的邏輯尺寸裡面定義這些點的位置)
          const origStageHeight = 500 - this.SelectionHeight * 2;
          let origNewImageWidth;
          if (700 / origStageHeight > ration) {
            origNewImageWidth = (origStageHeight - 30) * ration;
          } else {
            origNewImageWidth = 700 - 30;
          }

          // 得出新畫面相較於舊企劃畫面的放大縮小比例
          scaleFactor = NewImageWidth / origNewImageWidth;
        } else {
          // 如果是 NumberSeries，則全域不顯示此背景底圖
          this.ImageConfig = null;
        }
      } else {
        this.ImageConfig = null;
      }

      this.localMountPoints.forEach((item) => {
        if (item.isAbsolute) {
          this.ImageMountPoint.push({
            x: item.x,
            y: item.y,
            radius: 10,
            fill: "orange",
          });
        } else {
          // 考慮到有時 JSON 的 target point x/y 會有大小寫的差別 (防止意外 NaN)
          const itemX = item.x !== undefined ? item.x : item.X;
          const itemY = item.y !== undefined ? item.y : item.Y;

          this.ImageMountPoint.push({
            x: itemX * scaleFactor + NewX,
            y: itemY * scaleFactor + NewY + this.SelectionHeight,
            radius: 10 * Math.max(scaleFactor, 0.5), // 連線圓點大小跟著縮放
            fill: "orange",
          });
        }
      });

      this.configPoint(); // 重建配對解答組

      // 強迫畫面依照順序重繪
      this.$nextTick(() => {
        if (this.$refs.RectContainer) {
          this.$refs.RectContainer.getNode().moveToBottom();
          this.$refs.RectContainer.getNode().batchDraw();
        }
        if (this.$refs.LineLayer) {
          this.$refs.LineLayer.getNode().batchDraw(); // 在 RectContainer 之上
        }
        if (this.$refs.layer) {
          this.$refs.layer.getNode().moveToTop();
          this.$refs.layer.getNode().batchDraw(); // 選項與橘色點在最高層
        }
      });
    },
    StartDrawing(rectIndex) {
      if (rectIndex === -1) return;
      // 若該 rect 已連過線，先刪除舊線
      const oldId = this.linksByRect.get(rectIndex);
      if (oldId) this.removeLine(oldId);

      const start = this.rects[rectIndex];
      const id = crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now() + Math.random());

      const line = {
        id,
        rectIndex,
        pointIndex: null, // 還沒接到點
        points: [
          start.x + start.width / 2,
          start.y + start.height / 2,
          start.x + start.width / 2,
          start.y + start.height / 2,
        ],
        stroke: "black",
        strokeWidth: 10,
        lineCap: "round",
        lineJoin: "round",
      };

      this.lines.push(line);
      this.currentLineId = id;
    },
    Drawing() {
      if (!this.currentLineId) return;
      const line = this.lines.find((l) => l.id === this.currentLineId);
      if (!line) return;
      const { x, y } = this.$refs.stage.getNode().getPointerPosition();
      line.points.splice(2, 2, x, y);
      this.$refs.LineLayer.getNode().batchDraw();
    },
    EndDrawing() {
      if (!this.currentLineId) return;
      const { x, y } = this.$refs.stage.getNode().getPointerPosition();
      const pointIndex = this.WhichMountPoint(x, y);
      const line = this.lines.find((l) => l.id === this.currentLineId);

      if (pointIndex === -1) {
        // 沒接到點 -> 移除暫存線
        this.removeLine(this.currentLineId);
      } else {
        // 若該點已有線，先刪除舊線
        const oldId = this.linksByPoint.get(pointIndex);
        if (oldId) this.removeLine(oldId);

        // 完成線
        line.points.splice(
          2,
          2,
          this.ImageMountPoint[pointIndex].x,
          this.ImageMountPoint[pointIndex].y
        );
        line.pointIndex = pointIndex;

        this.linksByRect.set(line.rectIndex, line.id);
        this.linksByPoint.set(pointIndex, line.id);
      }

      this.currentLineId = null;
      this.$refs.LineLayer.getNode().batchDraw();
    },
    removeLine(id) {
      const idx = this.lines.findIndex((l) => l.id === id);
      if (idx === -1) return;
      const line = this.lines[idx];
      if (line.pointIndex !== null) this.linksByPoint.delete(line.pointIndex);
      this.linksByRect.delete(line.rectIndex);
      this.lines.splice(idx, 1);
    },
    WhichMountPoint(x, y) {
      for (let i = 0; i < this.ImageMountPoint.length; i++) {
        if (
          Math.pow(x - this.ImageMountPoint[i].x, 2) +
            Math.pow(y - this.ImageMountPoint[i].y, 2) <
          Math.pow(this.ImageMountPoint[i].radius, 2)
        ) {
          return i;
        }
      }
      return -1;
    },
    CheckAllAnswer() {
      const answerSet = new Set(this.Pair.map(([p, r]) => `${p}-${r}`));

      const wrong = [];
      for (const l of this.lines) {
        if (l.pointIndex === null) continue; // 忽略未接完的線
        const key = `${l.pointIndex}-${l.rectIndex}`;
        if (!answerSet.has(key)) wrong.push(l.id);
      }

      // 標紅錯線
      for (const id of wrong) {
        const line = this.lines.find((l) => l.id === id);
        if (line) {
          line.stroke = "red";
        }
      }
      this.$refs.LineLayer.getNode().batchDraw();

      const pass =
        wrong.length === 0 &&
        this.lines.filter((l) => l.pointIndex !== null).length ===
          this.Pair.length;

      this.$emit("play-effect", pass ? "CorrectSound" : "WrongSound");
      this.$emit("add-record", ["不支援", "不支援", pass ? "正確" : "錯誤"]);
      if (pass) this.$emit("next-question");

      return { WrongAmount: wrong.length, WrongAnsIndexs: wrong, Pass: pass };
    },
    parseLatexFraction(latexString) {
      // 解析 LaTeX 格式的分數，例如 "\\frac{1}{4}" -> {numerator: "1", denominator: "4"}
      const match = latexString.match(/\\frac\{([^}]+)\}\{([^}]+)\}/);
      if (match) {
        return {
          numerator: match[1],
          denominator: match[2],
        };
      }
      return null;
    },
    addText({ x, y, width, text, rectIndex }) {
      // 檢查是否為 LaTeX 分數格式
      const fractionData = this.parseLatexFraction(text);
      if (fractionData) {
        // 如果是分數，添加到 FractionTexts
        this.FractionTexts.push({
          x: x + width / 2, // 居中顯示
          y: y - 10, // 垂直居中
          numerator: fractionData.numerator,
          denominator: fractionData.denominator,
          fontSize: Math.max(this.FontSize - 4, 12), // 稍微小一點的字體
          color: "#111827",
          align: "center",
          rectIndex,
        });
      } else {
        // 如果是普通文字，添加到 Texts
        this.Texts.push({
          x,
          y,
          text,
          align: "center",
          width,
          fontSize: this.FontSize,
        });
      }
    },
    addRect(x, y, width, height) {
      this.rects.push({
        x,
        y,
        width,
        height,
        cornerRadius: this.RectCornerRaduis,
        fill: this.randomColor(),
      });
    },
    randomColor() {
      return ` #${
        this.randomColorlist[
          Math.floor(Math.random() * (this.randomColorlist.length - 1))
        ]
      }`;
    },
    configRect(containerWidth, containerHeight) {
      //Config Rect
      if (this.localSelections.length <= 4) {
        // 小於等於4，一行排列
        const RectWidth =
          (containerWidth - (this.localSelections.length + 1) * this.MinGap) /
          this.localSelections.length;

        this.localSelections.forEach((item, index) => {
          this.addRect(
            this.MinGap + index * (RectWidth + this.MinGap),
            0,
            RectWidth,
            this.SelectionHeight
          );
          this.addText({
            x: this.MinGap + index * (RectWidth + this.MinGap),
            y: (this.SelectionHeight - this.FontSize) / 2,
            text: item,
            width: RectWidth,
            rectIndex: index,
          });
        });
      } else {
        const RectWidth =
          (containerWidth -
            (this.localSelections.length / 2 + 1) * this.MinGap) /
          (this.localSelections.length / 2);
        this.localSelections.forEach((item, index) => {
          if (index % 2 === 0) {
            this.addRect(
              this.MinGap + parseInt(index / 2) * (RectWidth + this.MinGap),
              0,
              RectWidth,
              this.SelectionHeight
            );
            this.addText({
              x: this.MinGap + parseInt(index / 2) * (RectWidth + this.MinGap),
              y: (this.SelectionHeight - this.FontSize) / 2,
              width: RectWidth,
              text: item,
              rectIndex: index,
            });
          } else {
            this.addRect(
              this.MinGap + parseInt(index / 2) * (RectWidth + this.MinGap),
              containerHeight - this.SelectionHeight,
              RectWidth,
              this.SelectionHeight
            );
            this.addText({
              x: this.MinGap + parseInt(index / 2) * (RectWidth + this.MinGap),
              y: containerHeight - this.SelectionHeight / 2 - 10,
              text: item,
              width: RectWidth,
              rectIndex: index,
            });
          }
        });
      }
    },
    configPoint() {
      this.Pair = [];
      for (const i in this.localMountPoints) {
        for (const j in this.localSelections) {
          if (typeof this.localMountPoints[i].Connect2 === "string") {
            if (this.localMountPoints[i].Connect2 === this.localSelections[j]) {
              this.Pair.push([i, j]);
            }
          } else {
            for (const k in this.localMountPoints[i].Connect2) {
              if (
                this.localMountPoints[i].Connect2[k] === this.localSelections[j]
              ) {
                this.Pair.push([i, j]);
              }
            }
          }
        }
      }
    },
    setupData() {
      this.localSelections = [];
      this.localMountPoints = [];
      this.numberSeriesItems = [];
      this.seriesRects = [];
      this.seriesTexts = [];

      if (this.gameData.NumberSeries && this.gameData.NumberSeries.length > 0) {
        const selections = [];
        this.gameData.NumberSeries.forEach((item) => {
          let isBlank = false;
          let value = item;
          const match = item.match(/^\((.*)\)$/);
          if (match) {
            isBlank = true;
            value = match[1];
            selections.push(value);
          }
          this.numberSeriesItems.push({
            original: item,
            value,
            isBlank,
          });
        });
        this.localSelections = this.shuffleArray(selections);
      } else {
        this.localSelections = this.gameData.Selections || [];
      }
    },
    shuffleArray(array) {
      const res = [...array];
      for (let i = res.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [res[i], res[j]] = [res[j], res[i]];
      }
      return res;
    },
  },
};
</script>

<style scoped lang="scss">
.OutterContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $gap--small;
  width: 100%;
  height: 100%;
  min-height: 500px;
  .game-area {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    width: 100%;
    flex: 1; /* 會自動佔滿剩餘高度 */
    justify-content: center;
  }
}

.title {
  @extend .container-basic;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $primary-color;
  padding: $gap--small;
  width: 100%;
  a {
    font-size: $text-medium;
    font-weight: $text-bold;
  }
}

.main-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

.Functions {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 1rem;
  button {
    width: 100%;
    min-width: 200px;
    height: 3rem;
    border: none;
    background-color: $submit-color;
    border-radius: 15px;
    scale: 1;
    transition: 0.5s;
  }
  button:hover {
    scale: 1.1;
    transition: 0.5s;
  }
}
</style>
