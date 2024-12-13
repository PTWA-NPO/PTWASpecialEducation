<template>
  <div class="SideBar">
    <p class="Title">功能區</p>
    <div class="Buttons">
      <button
        v-if="GameStatus == 'Progressing'"
        class="btn btn-primary text-nowrap img-hover-zoom"
        @click="previousQuestion()"
      >
        <div class="d-flex align-items-center">
          <div class="">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-arrow-up"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"
              />
            </svg>
          </div>
          <div class="mx-auto">上一關</div>
        </div>
      </button>
      <button
        v-if="GameStatus == 'Progressing'"
        class="btn btn-primary text-nowrap img-hover-zoom"
        @click="nextQuestion()"
      >
        <div class="d-flex align-items-center">
          <div class="">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-arrow-down"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"
              />
            </svg>
          </div>
          <div class="mx-auto">下一關</div>
        </div>
      </button>
      <button
        v-if="GameStatus == 'NotStart'"
        class="btn btn-primary text-nowrap img-hover-zoom"
        @click="startGame()"
      >
        <div class="d-flex align-items-center">
          <div class="">
            <img :src="startGameIconSrc" />
          </div>
          <div class="mx-auto">開始</div>
        </div>
      </button>
      <button
        class="btn btn-primary text-nowrap img-hover-zoom"
        @click="reloadPage()"
      >
        <div class="d-flex align-items-center">
          <div class="">
            <img :src="restartIconSrc" />
          </div>
          <div class="mx-auto">重新開始</div>
        </div>
      </button>
      <button
        v-if="GameStatus == 'Done'"
        class="btn btn-primary text-nowrap img-hover-zoom"
        @click="toCSV()"
      >
        <div class="d-flex align-items-center">
          <div class="">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-file-earmark-arrow-down"
              viewBox="0 0 16 16"
            >
              <path
                d="M8.5 6.5a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 10.293z"
              />
              <path
                d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"
              />
            </svg>
          </div>
          <div class="mx-auto">下載</div>
        </div>
      </button>
      <!-- <button
        class="btn btn-primary text-nowrap img-hover-zoom"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
      >
        <div class="d-flex align-items-center">
          <div class="">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-patch-question-fill"
              viewBox="0 0 16 16"
            >
              <path
                d="M5.933.87a2.89 2.89 0 0 1 4.134 0l.622.638.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01zM7.002 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0m1.602-2.027c.04-.534.198-.815.846-1.26.674-.475 1.05-1.09 1.05-1.986 0-1.325-.92-2.227-2.262-2.227-1.02 0-1.792.492-2.1 1.29A1.7 1.7 0 0 0 6 5.48c0 .393.203.64.545.64.272 0 .455-.147.564-.51.158-.592.525-.915 1.074-.915.61 0 1.03.446 1.03 1.084 0 .563-.208.885-.822 1.325-.619.433-.926.914-.926 1.64v.111c0 .428.208.745.585.745.336 0 .504-.24.554-.627"
              />
            </svg>
          </div>
          <div class="mx-auto">教學</div>
        </div>
      </button> -->
      <button
        class="btn btn-primary text-nowrap img-hover-zoom"
        data-bs-toggle="modal"
        data-bs-target="#Calculator"
        @click="scratchSheet()"
      >
        <div class="d-flex align-items-center">
          <div class="">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-calculator"
              viewBox="0 0 16 16"
            >
              <path
                d="M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"
              />
              <path
                d="M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"
              />
            </svg>
          </div>
          <div class="mx-auto">計算紙</div>
        </div>
      </button>
      <button
        v-if="GameStatus == 'NotStart'"
        class="btn btn-primary text-nowrap img-hover-zoom"
        data-bs-toggle="modal"
        data-bs-target="#reappear"
      >
        <div class="d-flex align-items-center">
          <div class="">
            <img :src="reappearIconSrc" />
          </div>
          <div class="mx-auto">重現代碼</div>
        </div>
      </button>
      <button
        v-if="GameStatus == 'Done'"
        class="btn btn-primary text-nowrap img-hover-zoom"
      >
        <div class="d-flex align-items-center">
          <div class="">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-copy"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
              />
            </svg>
          </div>
          <div class="mx-auto" @click="copyReappearCode">複製重現代碼</div>
        </div>
      </button>
      <button
        v-if="!isFullScreen"
        class="btn btn-primary text-nowrap img-hover-zoom"
      >
        <div class="d-flex align-items-center">
          <div class="">
            <i class="bi bi-zoom-in" />
          </div>
          <div class="mx-auto" @click="handleEnterFullScreen">全螢幕</div>
        </div>
      </button>
      <button
        v-if="isFullScreen"
        class="btn btn-primary text-nowrap img-hover-zoom"
      >
        <div class="d-flex align-items-center">
          <div class="">
            <i class="bi bi-zoom -out" />
          </div>
          <div class="mx-auto" @click="handleEnterFullScreen">退出全螢幕</div>
        </div>
      </button>
      <slot name="hint" />
    </div>

    <!-- 重現代碼 -->
    <div
      id="reappear"
      class="modal fade"
      tabindex="-1"
      aria-labelledby="reappearLabel"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 id="reappearLabel" class="modal-title fs-5">重現代碼</h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div class="modal-body">
            <p>請將csv檔中的重現代碼貼到此處</p>
            <div class="input-group flex-nowrap">
              <input
                v-model="code"
                type="text"
                class="form-control"
                placeholder="重現代碼"
                aria-label="number"
                aria-describedby="addon-wrapping"
              />
            </div>
            <p v-if="!checkformat" style="color: red">
              請貼上正確的重現代碼，若確認代碼沒有錯卻無法送出，可能是遊戲已更新，代碼會自動失效
            </p>
            {{ gameCode }}
            <button class="btn btn-primary text-nowrap img-hover-zoom">
              <div class="d-flex align-items-center">
                <div class="">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-copy"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
                    />
                  </svg>
                </div>
                <div class="mx-auto" @click="copyReappearCode">
                  複製重現代碼
                </div>
              </div>
            </button>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              data-bs-dismiss="modal"
              :disabled="!checkformat"
              @click="reappearCode"
            >
              套用代碼
            </button>
          </div>
        </div>
      </div>
    </div>
    {{ isFullScreen }}
  </div>
</template>
<script>
import gameStore from "@/stores/game";
import { mapWritableState } from "pinia";
import { getSystemAssets } from "@/utilitys/get_assets";

export default {
  name: "SideBar",
  props: {
    GameStatus: {
      type: String,
      default: "NotStart",
    },
    HintInfo: {
      type: Object,
      default: () => {},
    },
    Hint: {
      type: Object,
      default: () => {},
    },
    download_data: {
      type: Array,
      default: () => [],
    },
    levelAmount: {
      type: Number,
      default: 0,
    },
  },
  emits: [
    "previousQuestion",
    "next-question",
    "startGame",
    "toCsv",
    "scratchSheet",
    "reappearCode",
  ],
  data() {
    return {
      CalculatorSwitch: false,
      code: "",
      isFullScreen: false,
      startGameIconSrc: getSystemAssets("start.png", "side_bar"),
      restartIconSrc: getSystemAssets("restart.png", "side_bar"),
      reappearIconSrc: getSystemAssets("reappear-code.png", "side_bar"),
    };
  },
  computed: {
    ...mapWritableState(gameStore, ["gameCode"]),
    checkformat() {
      if (this.code == "origin") return true;
      if (this.code.split("-").length == this.levelAmount) {
        return true;
      } else {
        return false;
      }
    },
  },
  created() {
    if (document.fullscreenElement) {
      this.isFullScreen = true;
    }
  },
  methods: {
    previousQuestion() {
      this.$emit("previousQuestion");
    },
    nextQuestion() {
      this.$emit("next-question");
    },
    startGame() {
      this.$emit("startGame");
    },
    reloadPage() {
      location.reload();
    },
    toCSV(data) {
      this.$emit("toCsv", data);
    },
    scratchSheet() {
      this.$emit("scratchSheet");
    },
    reappearCode() {
      this.gameCode = this.code;
      this.$emit("reappearCode");
    },
    copyReappearCode() {
      // 檢查瀏覽器是否支援 Clipboard API
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(this.gameCode)
          .then(() => {
            alert("文字已成功複製");
          })
          .catch((err) => {
            alert("無法複製文字", err);
          });
      } else {
        // 如果不支援 Clipboard API，則使用舊的方法
        const textarea = document.createElement("textarea");
        textarea.value = this.gameCode;

        // 防止顯示在頁面上
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";

        document.body.appendChild(textarea);

        // 選取textarea中的文字
        textarea.select();
        textarea.setSelectionRange(0, 99999); // 對於行動裝置的兼容

        // 嘗試複製選取的文字
        try {
          document.execCommand("copy");
          alert("文字已成功複製");
        } catch (err) {
          alert("無法複製文字", err);
        }
        // 移除textarea
        document.body.removeChild(textarea);
      }
    },
    handleEnterFullScreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        this.isFullScreen = false;
      } else {
        document.documentElement.requestFullscreen();
        this.isFullScreen = true;
      }
    },
  },
};
</script>
<style scoped lang="scss">
.SideBar {
  border-left: solid 3px #aaa;
  background-color: #ffedda;
  height: 100%;
  width: 15%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  padding-top: 1rem;
  .Buttons {
    padding: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: stretch;
    button {
      align-self: center;
      width: 93%;
      font-size: 1.2rem;
      border-radius: 12px;
      height: 4rem;
      padding: 0.4rem;

      img {
        height: 80%;
        max-width: 40px;
        max-height: 40px;
      }
    }
  }
  .Title {
    font-size: 2rem;
    text-align: start;
  }
  svg {
    width: 2vw;
    height: 2vw;
  }
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
