<template>
  <div class="link-to-table">
    <div class="link-to-table__header">
      <a class="link-to-table__title">{{ gameData.Question }}</a>
    </div>
    <div class="link-to-table__game-area">
      <div class="link-to-table__stage">
        <v-stage
          ref="stage"
          :config="stageConfig"
          @pointermove="Drawing"
          @pointerup="EndDrawing"
        >
          <v-layer ref="RectContainer">
            <v-rect
              v-for="(item, index) in rects"
              :key="index"
              :config="item"
              @pointerdown="StartDrawing(index)"
            />
            <v-text
              v-for="(item, index) in Texts"
              :key="index"
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
          <v-layer ref="TableLayer">
            <!-- 表格框線 -->
            <v-rect
              v-for="(cell, index) in tableCells"
              :key="`cell-${index}`"
              :config="cell"
            />
            <!-- 表格文字 -->
            <v-text
              v-for="(text, index) in tableCellTexts"
              :key="`text-${index}`"
              :config="text"
            />
            <!-- 挖空位置的圓點 -->
            <v-circle
              v-for="(point, index) in TableMountPoints"
              :key="`point-${index}`"
              :config="point"
            />
          </v-layer>
          <v-layer ref="LineLayer">
            <v-line v-for="line in lines" :key="line.id" :config="line" />
          </v-layer>
        </v-stage>
      </div>
    </div>
  </div>
</template>

<script>
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";
import KonvaFractionText from "@/components/KonvaFractionText.vue";

export default {
  name: "LinkToTableGame",
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
      stageConfig: {
        width: 700,
        height: 600,
      },
      rects: [],
      lines: [],
      currentLineId: null,
      linksByRect: new Map(),
      linksByPoint: new Map(),
      Texts: [],
      FractionTexts: [],
      tableCells: [],
      tableCellTexts: [],
      TableMountPoints: [],
      MinGap: 10,
      Pair: [],
      FontSize: 20,
      SelectionHeight: 50,
      RectCornerRaduis: 15,
      TableStartY: 20, // 表格開始的Y座標 (往上移)
      shuffledSelections: [], // 打亂後的選項
    };
  },
  created() {
    this.shuffleSelections();
    this.drawTable();
    this.configRect();
    this.configPoint();
    emitter.on("submitAnswer", this.CheckAllAnswer);
  },
  mounted() {
    const TableLayer = this.$refs.TableLayer.getNode();
    TableLayer.moveToBottom();
    TableLayer.draw();
    const RectContainer = this.$refs.RectContainer.getNode();
    RectContainer.moveToTop();
    RectContainer.draw();
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.CheckAllAnswer);
  },
  methods: {
    shuffleSelections() {
      // Fisher-Yates 洗牌演算法
      const selections = [...this.gameData.Selections];
      for (let i = selections.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selections[i], selections[j]] = [selections[j], selections[i]];
      }
      this.shuffledSelections = selections;
    },
    drawTable() {
      const config = this.gameData.TableConfig;
      const tableData = this.gameData.TableData;

      const cellWidth = config.cellWidth || 100;
      const cellHeight = config.cellHeight || 60;
      const rows = config.rows || tableData.length;
      const cols = config.cols || (tableData[0] ? tableData[0].length : 0);

      // 計算表格總寬度和起始X座標(居中)
      const tableWidth = cols * cellWidth;
      const startX = (this.stageConfig.width - tableWidth) / 2;

      // 繪製表格
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = startX + col * cellWidth;
          const y = this.TableStartY + row * cellHeight;

          // 繪製格子
          this.tableCells.push({
            x,
            y,
            width: cellWidth,
            height: cellHeight,
            stroke: "#333",
            strokeWidth: 2,
            fill: "#ffffff",
          });

          // 取得格子內容
          const cellContent = tableData[row] ? tableData[row][col] : "";

          if (cellContent === "" || cellContent === null) {
            // 挖空格子 - 添加圓點
            this.TableMountPoints.push({
              x: x + cellWidth / 2,
              y: y + cellHeight / 2,
              radius: 10,
              fill: "orange",
              row,
              col,
            });
          } else {
            // 有內容的格子 - 添加文字 (垂直置中)
            this.tableCellTexts.push({
              x,
              y,
              width: cellWidth,
              height: cellHeight,
              text: cellContent,
              fontSize: this.FontSize,
              fill: "#000",
              align: "center",
              verticalAlign: "middle",
            });
          }
        }
      }
    },
    StartDrawing(rectIndex) {
      const oldId = this.linksByRect.get(rectIndex);
      if (oldId) this.removeLine(oldId);

      const start = this.rects[rectIndex];
      const id = crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now() + Math.random());

      const line = {
        id,
        rectIndex,
        pointIndex: null,
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
        this.removeLine(this.currentLineId);
      } else {
        const oldId = this.linksByPoint.get(pointIndex);
        if (oldId) this.removeLine(oldId);

        line.points.splice(
          2,
          2,
          this.TableMountPoints[pointIndex].x,
          this.TableMountPoints[pointIndex].y
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
      for (let i = 0; i < this.TableMountPoints.length; i++) {
        if (
          Math.pow(x - this.TableMountPoints[i].x, 2) +
            Math.pow(y - this.TableMountPoints[i].y, 2) <
          Math.pow(this.TableMountPoints[i].radius, 2)
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
        if (l.pointIndex === null) continue;
        const key = `${l.pointIndex}-${l.rectIndex}`;
        if (!answerSet.has(key)) wrong.push(l.id);
      }

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
      const fractionData = this.parseLatexFraction(text);
      if (fractionData) {
        this.FractionTexts.push({
          x: x + width / 2,
          y: y - 10,
          numerator: fractionData.numerator,
          denominator: fractionData.denominator,
          fontSize: Math.max(this.FontSize - 4, 12),
          color: "#111827",
          align: "center",
          rectIndex,
        });
      } else {
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
        fill: "#F6BD60",
      });
    },
    configRect() {
      // 計算表格的底部位置
      const config = this.gameData.TableConfig;
      const tableData = this.gameData.TableData;
      const cellHeight = config.cellHeight || 60;
      const rows = config.rows || tableData.length;
      const tableBottomY = this.TableStartY + rows * cellHeight;
      
      // 選項放在表格下方,間距50px
      const selectionY = tableBottomY + 50;
      
      if (this.shuffledSelections.length <= 4) {
        const RectWidth =
          (this.stageConfig.width -
            (this.shuffledSelections.length + 1) * this.MinGap) /
          this.shuffledSelections.length;

        this.shuffledSelections.forEach((item, index) => {
          this.addRect(
            this.MinGap + index * (RectWidth + this.MinGap),
            selectionY,
            RectWidth,
            this.SelectionHeight
          );
          this.addText({
            x: this.MinGap + index * (RectWidth + this.MinGap),
            y: selectionY + (this.SelectionHeight - this.FontSize) / 2,
            text: item,
            width: RectWidth,
            rectIndex: index,
          });
        });
      } else {
        const RectWidth =
          (this.stageConfig.width -
            (this.shuffledSelections.length / 2 + 1) * this.MinGap) /
          (this.shuffledSelections.length / 2);
        this.shuffledSelections.forEach((item, index) => {
          const yPos = selectionY + (index % 2 === 0 ? 0 : this.SelectionHeight + this.MinGap);
          
          this.addRect(
            this.MinGap + parseInt(index / 2) * (RectWidth + this.MinGap),
            yPos,
            RectWidth,
            this.SelectionHeight
          );
          this.addText({
            x: this.MinGap + parseInt(index / 2) * (RectWidth + this.MinGap),
            y: yPos + (this.SelectionHeight - this.FontSize) / 2,
            text: item,
            width: RectWidth,
            rectIndex: index,
          });
        });
      }
    },
    configPoint() {
      this.Pair = [];
      // 處理新的資料格式: position: [row, col]
      for (const i in this.gameData.MountPoint) {
        const mountPoint = this.gameData.MountPoint[i];
        const position = mountPoint.position; // [row, col]

        // 找到對應的 TableMountPoint index
        const pointIndex = this.TableMountPoints.findIndex(
          (p) => p.row === position[0] && p.col === position[1]
        );

        if (pointIndex === -1) continue;

        for (const j in this.shuffledSelections) {
          if (typeof mountPoint.Connect2 === "string") {
            if (mountPoint.Connect2 === this.shuffledSelections[j]) {
              this.Pair.push([pointIndex, j]);
            }
          } else {
            for (const k in mountPoint.Connect2) {
              if (mountPoint.Connect2[k] === this.shuffledSelections[j]) {
                this.Pair.push([pointIndex, j]);
              }
            }
          }
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">
.link-to-table {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $gap--small;

  &__header {
    @extend .container-basic;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: $primary-color;
    padding: $gap--small;
    width: 100%;
  }

  &__title {
    font-size: $text-medium;
    font-weight: $text-bold;
  }

  &__game-area {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }

  &__stage {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
