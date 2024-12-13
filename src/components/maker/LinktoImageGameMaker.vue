<template>
  <div class="container">
    <!-- 控制区 -->
    <div class="controls">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleImageUpload"
      >
      <button :disabled="!image" @click="startRecording">
        開始紀錄
      </button>
      <button :disabled="points.length === 0" @click="deleteLastPoint">
        刪除上一個點
      </button>
      <button :disabled="points.length === 0" @click="deleteAllPoints">
        刪除所有的點
      </button>
      <button :disabled="!image" @click="reuploadImage">
        重新上傳圖片
      </button>
    </div>

    <!-- 舞台区域 -->
    <div class="stage-container">
      <v-stage ref="stage" :config="stageConfig">
        <v-layer>
          <!-- 上方矩形 -->
          <v-rect :config="upperRectConfig" />
          <!-- 下方矩形 -->
          <v-rect :config="lowerRectConfig" />

          <!-- 图片 -->
          <v-image
            v-if="image"
            :config="imageConfig"
            @click="handleImageClick"
          />

          <!-- 标记点 -->
          <v-circle
            v-for="(point, index) in points"
            :key="index"
            :config="{
              x: point.x + imageConfig.x,
              y: point.y + imageConfig.y,
              radius: 5,
              fill: 'yellow',
            }"
          />
        </v-layer>
      </v-stage>
    </div>

    <!-- JSON 输出 -->
    <div class="json-output">
      <h3>點座標 (JSON):</h3>
      <pre>{{ formattedPoints }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      image: null,
      imageConfig: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        image: null,
      },
      stageConfig: {
        width: 700,
        height: 500,
      },
      recording: false,
      points: [],
      SelectionHeight: 50,
      upperRectConfig: {
        x: 0,
        y: 0,
        width: 700,
        height: 50,
        fill: "lightgrey",
      },
      lowerRectConfig: {
        x: 0,
        y: 450,
        width: 700,
        height: 50,
        fill: "lightgrey",
      },
    };
  },
  computed: {
    formattedPoints() {
      return JSON.stringify(this.points, null, 2);
    },
  },
  methods: {
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const img = new window.Image();
          img.onload = () => {
            this.loadImage(img);
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    loadImage(img) {
      const StageHeight = this.stageConfig.height - this.SelectionHeight * 2;
      let imgWidth = img.width;
      let imgHeight = img.height;
      let ratio = imgWidth / imgHeight;

      let NewImageWidth, NewImageHeight;

      if (this.stageConfig.width / StageHeight > ratio) {
        // 根据高度缩放
        NewImageHeight = StageHeight - 30;
        NewImageWidth = NewImageHeight * ratio;
      } else {
        // 根据宽度缩放
        NewImageWidth = this.stageConfig.width - 30;
        NewImageHeight = NewImageWidth / ratio;
      }

      let NewX = (this.stageConfig.width - NewImageWidth) / 2;
      let NewY = (StageHeight - NewImageHeight) / 2 + this.SelectionHeight;

      this.imageConfig = {
        image: img,
        x: NewX,
        y: NewY,
        width: NewImageWidth,
        height: NewImageHeight,
      };

      this.image = img;
      this.points = [];
      this.recording = false;
    },
    startRecording() {
      this.recording = true;
    },
    handleImageClick(e) {
      if (this.recording) {
        const pos = e.target.getStage().getPointerPosition();
        const x = pos.x - this.imageConfig.x;
        const y = pos.y - this.imageConfig.y;

        if (
          x >= 0 &&
          x <= this.imageConfig.width &&
          y >= 0 &&
          y <= this.imageConfig.height
        ) {
          this.points.push({ x: x, y: y });
        }
      }
    },
    deleteLastPoint() {
      this.points.pop();
    },
    deleteAllPoints() {
      this.points = [];
    },
    reuploadImage() {
      this.image = null;
      this.imageConfig = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        image: null,
      };
      this.points = [];
      this.recording = false;
      this.$refs.fileInput.value = null;
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.stage-container {
  border: 1px solid #ccc;
}

.json-output {
  margin-top: 20px;
  width: 700px;
  text-align: left;
}
</style>
