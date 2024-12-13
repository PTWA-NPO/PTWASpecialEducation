<template>
  <div class="">
    <div>
      <canvas
        id="cvs"
        class="center"
        width="600"
        height="400"
        style="border: 1px solid #000"
        @click="judge_position($event)"
      />
    </div>
    <input id="fileInput" type="file">
    <div>
      <input v-model="inputNumber" type="text">
      <button @click="Start">
        開始計算
      </button>
    </div>
    <div v-if="counter2 - 1 == parseInt(inputNumber)" class="">
      <p style="color: red; font-size: 2rem">
        紀錄完成
      </p>
    </div>
    <div class="">
      <div>
        <button
          v-for="(item, index) in btn"
          :class="{ actbtn: drawed[index + 1] }"
        >
          {{ item }}
        </button>
      </div>
      <hr>
      <div>
        <p>正在紀錄</p>
        <p>請做: {{ command[counter - 1] }}</p>
        {{ drawingprototype }}
      </div>
      <hr>
      <div class="">
        <p>紀錄</p>
        {{ location }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "FindTheItem",
  data() {
    return {
      location: [],
      inputNumber: "",
      btn: null,
      drawed: [],
      counter: 1,
      counter2: 1,
      command: ["物件左上角", "物件右下角"],
      prototype: {
        Name: "",
        LeftTop: [],
        RightBottom: [],
      },
      drawingprototype: {
        Name: "",
        LeftTop: [],
        RightBottom: [],
      },
    };
  },
  created() {},
  mounted() {
    document
      .getElementById("fileInput")
      .addEventListener("change", function (event) {
        const file = event.target.files[0]; // 獲取用戶選擇的檔案
        if (file) {
          const reader = new FileReader(); // 創建一個 FileReader
          reader.onload = function (e) {
            const img = new Image(); // 創建一個 Image
            img.onload = function () {
              console.log("Hello");
              var cvs = document.getElementById("cvs");
              const ctx = cvs.getContext("2d");
              ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
            };
            img.src = e.target.result; // 設置圖片來源為讀取結果
          };
          reader.readAsDataURL(file); // 讀取檔案內容為 Data URL
        }
      });
  },
  methods: {
    Start() {
      let temp = parseInt(this.inputNumber);
      this.btn = [];
      this.drawed = [];
      this.location = [];
      for (var i = 1; i <= temp; i++) {
        this.btn.push(i);
        this.drawed.push(false);
      }
    },
    outCircle(x, y) {
      console.log("draw circle on number");
      var canvas = document.getElementById("cvs");
      var ctx = canvas.getContext("2d");
      // 設定圓形參數
      var radius = 50; //半徑
      var lineWidth = 2;
      var strokeColor = "red";
      // 繪製圓形
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    },
    judge_position(event) {
      console.log(event.pageX, event.pageY);
      if (this.counter == 1) {
        this.drawingprototype.LeftTop = [event.pageX, event.pageY];
        this.counter++;
      } else if (this.counter == 2) {
        this.drawingprototype.RightBottom = [event.pageX, event.pageY];
        // this.drawed[this.counter-1] = true;
        this.counter = 1;
        this.counter2++;
        this.location.push(this.drawingprototype);
        this.drawingprototype = {
          Name: "",
          LeftTop: [],
          RightBottom: [],
        };
        this.drawed[this.counter2 - 1] = true;
      }
    },
  },
};
</script>

<style scoped lang="scss">
button {
  background-color: #cb9fcf;
}
.actbtn {
  background-color: rgb(108, 117, 88) !important;
}
</style>
