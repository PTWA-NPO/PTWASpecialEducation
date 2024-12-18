<template>
  <div class="OutterContainer container">
    <div class="title">
      <a>{{ GameData.Question }}</a>
    </div>
    <div class="game-area">
      <div class="main-stage">
        <v-stage
          ref="stage"
          :config="stageConfig"
          @pointermove="Drawing"
          @pointerup="EndDrawing"
        >
          <v-layer ref="RectContainer">
            <v-rect
              v-for="(item, index) in Rects"
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
          </v-layer>
          <v-layer ref="layer">
            <v-image :config="ImageConfig" />
            <v-circle
              v-for="(item, index) in ImageMountPoint"
              :key="index"
              :config="item"
            />
          </v-layer>
          <v-layer ref="LineLayer">
            <v-line
              v-for="(item, index) in Lines"
              :key="index"
              :config="item"
            />
          </v-layer>
        </v-stage>
      </div>
      <div class="Functions">
        <button @click="CheckAllAnswer">檢查答案</button>
        <button @click="ClearAll">清除所有答案</button>
        <button @click="Pop">清除最後一個</button>

        <div class="error">
          <p
            v-if="
              ErrorMesseagesSwitch.AllAnswerNotFinish ||
              ErrorMesseagesSwitch.WrongAnswer
            "
            class="header"
          >
            錯誤
          </p>
          <p v-if="ErrorMesseagesSwitch.AllAnswerNotFinish">所有答案尚未完成</p>
          <p v-if="ErrorMesseagesSwitch.WrongAnswer">答案有誤</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getGameAssets } from "@/utilitys/get_assets.js";
export default {
  name: "LinktoImageGame",
  GameData: {
    type: Object,
    required: true,
  },
  GameConfig: {
    type: Object,
    required: true,
  },
  ID: {
    type: String,
    required: true,
  },
  emits: ["play-effect", "add-record", "next-question"],
  data() {
    return {
      stageConfig: {
        width: 700,
        height: 500,
      },
      Rects: [],
      Lines: [],
      Texts: [],
      LineLayer: [],
      OnDrawingLine: {},
      ImageConfig: {},
      ImageMountPoint: [],
      MinGap: 10,
      OnDrawingRectIndex: null,
      OnDrawing: false,
      Pair: [],
      FontSize: 20,
      LinkedRecord: [],
      SelectionHeight: 50,
      RectCornerRaduis: 15,
      ErrorMesseagesSwitch: {
        AllAnswerNotFinish: false,
        WrongAnswer: false,
      },
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
    let BGImage = new window.Image();
    BGImage.src = getGameAssets(this.ID, this.GameData.BGSrc);

    // 當圖片載入完成後再進行縮放和定位計算
    BGImage.onload = () => {
      let StageHeight = this.stageConfig.height - this.SelectionHeight * 2;

      let imgWidth = BGImage.width;
      let imgHeight = BGImage.height;

      // 計算寬高比
      let ration = imgWidth / imgHeight;

      // 計算適合的寬度和高度，使其不超過stage的寬高
      let NewImageWidth, NewImageHeight;

      if (this.stageConfig.width / StageHeight > ration) {
        // 如果stage更寬，根據高度來縮放
        NewImageHeight = StageHeight - 30;
        NewImageWidth = NewImageHeight * ration;
      } else {
        // 如果stage更高，根據寬度來縮放
        NewImageWidth = this.stageConfig.width - 30;
        NewImageHeight = NewImageWidth / ration;
      }

      // 計算圖片的位置，使其居中顯示
      let NewX = (this.stageConfig.width - NewImageWidth) / 2;
      let NewY = (StageHeight - NewImageHeight) / 2;
      console.log(NewX, NewY);
      // 設定ImageConfig
      this.ImageConfig = {
        image: BGImage,
        width: NewImageWidth,
        height: NewImageHeight,
        x: NewX,
        y: NewY + this.SelectionHeight,
      };

      console.log(this.ImageConfig.x, this.ImageConfig.y);
      this.GameData.MountPoint.forEach((item) => {
        this.ImageMountPoint.push({
          x: item.x + NewX,
          y: item.y + NewY + this.SelectionHeight,
          radius: 10,
          fill: "yellow",
        });
      });
    };

    this.configRect();
    this.configPoint();
  },
  mounted() {
    // Stage border
    // this.InitAnswer();
    let layer = this.$refs.layer.getNode();
    layer.moveToBottom();
    layer.draw();
    let RectContainer = this.$refs.RectContainer.getNode();
    RectContainer.moveToTop();
    RectContainer.draw();
  },
  methods: {
    StartDrawing(index) {
      this.OnDrawingRectIndex = index;
      this.OnDrawing = true;
      this.ErrorMesseagesSwitch.WrongAnswer = false;
      // 創建新的線條並添加到 Lines 數組
      const newLine = {
        points: [
          this.Rects[index].x + this.Rects[index].width / 2,
          this.Rects[index].y + this.Rects[index].height / 2,
          this.Rects[index].x + this.Rects[index].width / 2,
          this.Rects[index].y + this.Rects[index].height / 2,
        ],
        stroke: "black",
        strokeWidth: 10,
        lineCap: "round",
        lineJoin: "round",
      };
      this.Lines.push(newLine);
      this.currentLine = newLine; // 保存對當前線的引用
    },

    Drawing(e) {
      if (this.OnDrawing && this.currentLine) {
        let MousePos = this.$refs.stage.getNode().getPointerPosition();
        this.currentLine.points.splice(2, 2, MousePos.x, MousePos.y);
        this.$refs.LineLayer.getNode().batchDraw(); // 使用 batchDraw 來優化性能
      }
    },
    EndDrawing(e) {
      if (!this.OnDrawing) {
        return;
      }
      let MousePos = this.$refs.stage.getNode().getPointerPosition();
      let point = this.WhichMountPoint(MousePos.x, MousePos.y);
      let linkedBefore = this.CheckPairedBefore(this.OnDrawingRectIndex, point);

      if (point === -1 || linkedBefore) {
        // 如果沒有連接到有效的點，刪除最後添加的線
        this.Lines.pop();
      } else {
        // 更新線的終點為有效的連接點
        this.currentLine.points.splice(
          2,
          2,
          this.ImageMountPoint[point].x,
          this.ImageMountPoint[point].y
        );
      }
      if (point != -1 && linkedBefore != true)
        this.LinkedRecord.push([this.OnDrawingRectIndex, point]);
      this.OnDrawing = false;
      this.currentLine = null;
      this.$refs.LineLayer.getNode().batchDraw();
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
    CheckPairedBefore(x, y) {
      for (let i in this.LinkedRecord) {
        if (this.LinkedRecord[i][0] == x && this.LinkedRecord[i][1] == y) {
          return true;
        }
      }
      return false;
    },
    MarkWrongLine(start, end) {
      let WrongLine = {
        points: [
          this.Rects[start].x + this.Rects[start].width / 2,
          this.Rects[start].y + this.Rects[start].height / 2,
          this.ImageMountPoint[end].x,
          this.ImageMountPoint[end].y,
        ],
        stroke: "red",
        strokeWidth: 10,
        lineCap: "round",
        lineJoin: "round",
      };
      for (let i in this.Lines) {
        if (
          this.Lines[i].points[0] == WrongLine.points[0] &&
          this.Lines[i].points[1] == WrongLine.points[1]
        ) {
          this.Lines[i] = WrongLine;
        }
      }
    },
    CheckAllAnswer() {
      let WrongAnsIndexs = [];
      let WrongAmount = 0;
      let Pass = false;
      for (let i in this.LinkedRecord) {
        let ans = false;
        for (let j in this.Pair) {
          if (
            this.LinkedRecord[i][0] == this.Pair[j][1] &&
            this.LinkedRecord[i][1] == this.Pair[j][0]
          ) {
            ans = true;
          }
        }
        if (ans == false) {
          WrongAnsIndexs.push(i);
          WrongAmount++;
          this.ErrorMesseagesSwitch.WrongAnswer = true;
          this.MarkWrongLine(this.LinkedRecord[i][0], this.LinkedRecord[i][1]);
        }
      }
      if (this.LinkedRecord.length != this.Pair.length) {
        this.ErrorMesseagesSwitch.AllAnswerNotFinish = true;
      } else {
        this.ErrorMesseagesSwitch.AllAnswerNotFinish = false;
      }
      if (this.LinkedRecord.length == this.Pair.length && WrongAmount == 0) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", ["不支援", "不支援", "正確"]);
        this.$emit("next-question");
        Pass = true;
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", ["不支援", "不支援", "正確"]);
        Pass = false;
      }
      return {
        WrongAmount: WrongAmount,
        WrongAnsIndexs: WrongAnsIndexs,
        Pass: Pass,
      };
    },
    Pop() {
      if (this.LinkedRecord.length > 0) {
        this.LinkedRecord.pop();
        this.Lines.pop();
        this.$refs.LineLayer.getNode().batchDraw();
      }
    },
    ClearAll() {
      this.LinkedRecord = [];
      this.Lines = [];
      this.$refs.LineLayer.getNode().batchDraw();
    },
    addText({ x, y, width, text }) {
      this.Texts.push({
        x: x,
        y: y,
        text: text,
        align: "center",
        width: width,
        fontSize: this.FontSize,
      });
    },
    addRect(x, y, width, height) {
      this.Rects.push({
        x: x,
        y: y,
        width: width,
        height: height,
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
    configRect() {
      //Config Rect
      if (this.GameData.Selections.length <= 4) {
        // 小於等於4，一行排列
        let RectWidth =
          (this.stageConfig.width -
            (this.GameData.Selections.length + 1) * this.MinGap) /
          this.GameData.Selections.length;

        this.GameData.Selections.forEach((item, index) => {
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
          });
        });
      } else {
        let RectWidth =
          (this.stageConfig.width -
            (this.GameData.Selections.length / 2 + 1) * this.MinGap) /
          (this.GameData.Selections.length / 2);
        this.GameData.Selections.forEach((item, index) => {
          if (index % 2 == 0) {
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
            });
          } else {
            this.addRect(
              this.MinGap + parseInt(index / 2) * (RectWidth + this.MinGap),
              this.stageConfig.height - this.SelectionHeight,
              RectWidth,
              this.SelectionHeight
            );
            this.addText({
              x: this.MinGap + parseInt(index / 2) * (RectWidth + this.MinGap),
              y: this.stageConfig.height - this.SelectionHeight / 2 - 10, // 10 is magic number
              text: item,
              width: RectWidth,
            });
          }
        });
      }
    },
    configPoint() {
      this.Pair = [];
      for (let i in this.GameData.MountPoint) {
        for (let j in this.GameData.Selections) {
          if (typeof this.GameData.MountPoint[i].Connect2 == "string") {
            if (
              this.GameData.MountPoint[i].Connect2 ==
              this.GameData.Selections[j]
            ) {
              this.Pair.push([i, j]);
            }
          } else {
            for (let k in this.GameData.MountPoint[i].Connect2) {
              if (
                this.GameData.MountPoint[i].Connect2[k] ==
                this.GameData.Selections[j]
              ) {
                this.Pair.push([i, j]);
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
.OutterContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $gap--small;
  .game-area {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
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
    background-color: #4caf50;
    border-radius: 15px;
    scale: 1;
    transition: 0.5s;
  }
  button:hover {
    scale: 1.1;
    transition: 0.5s;
  }
  .error {
    align-self: flex-start;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    .header {
      font-size: $text-medium;
      font-weight: $text-bold;
    }
    p {
      font-weight: $text-bold;
      color: $error-color;
    }
  }
}
</style>
