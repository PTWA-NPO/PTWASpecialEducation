<template>
  <!-- 大於0的話 -->
  <div class="Content" :class="{ progressShake: Shake }">
    <!-- <p class="h3">生命值:  {{ (this.HintInfo.MaxWrongTimes - this.HintInfo.WrongTimes) > 0 ? this.HintInfo.MaxWrongTimes - this.HintInfo.WrongTimes: 0}}</p> -->
    <div class="Heart">
      <!-- eslint-disable vue/no-unused-vars-->
      <p
        v-for="i in HintInfo.MaxWrongTimes - HintInfo.WrongTimes > 0
          ? HintInfo.MaxWrongTimes - HintInfo.WrongTimes
          : 0"
      >
        ❤
      </p>
    </div>

    <!-- 以下保留，請勿刪除 -->
    <!-- <div class="progress" >
            <div class="progress-bar bg-danger" role="progressbar" :style="{ width:this.hint_percentage }" :aria-valuenow="this.percentage" aria-valuemin="0" aria-valuemax="100"></div>
        </div> -->

    <button
      v-if="showhint"
      class="btn btn-primary text-nowrap img-hover-zoom"
      data-bs-toggle="modal"
      data-bs-target="#hint"
      @click="gethint()"
    >
      <div class="d-flex align-items-center">
        <div class="">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-info-square-fill"
            viewBox="0 0 16 16"
          >
            <path
              d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm8.93 4.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
            />
          </svg>
        </div>
        <div class="mx-auto">點我看提示</div>
      </div>
    </button>
  </div>
</template>
<script>
export default {
  name: "HintButton",
  props: {
    HintInfo: {
      type: Object,
      required: true,
    },
  },
  emits: ["openHintModal"],
  data() {
    return {
      showhint: false,
      percentage: 0,
      Shake: false,
    };
  },
  computed: {
    hint_percentage() {
      return `${this.percentage}%`;
    },
  },
  watch: {
    HintInfo: {
      handler: function () {
        this.updated_hint_status();
        this.shrinkHint();
        console.log(this.HintInfo.WrongTimes);
      },
      deep: true,
    },
  },
  mounted() {
    // Code to run when the component is mounted goes here
    this.updated_hint_status();
  },
  methods: {
    gethint() {
      const mediaType = "hint";
      this.$emit("openHintModal", mediaType);
    },
    updated_hint_status() {
      let temp =
        this.HintInfo.MaxWrongTimes - this.HintInfo.WrongTimes > 0
          ? this.HintInfo.MaxWrongTimes - this.HintInfo.WrongTimes
          : 0;
      this.percentage = temp * (100 / this.HintInfo.MaxWrongTimes);
      if (this.percentage > 0) {
        this.showhint = false;
      } else {
        this.showhint = true;
      }
    },
    async shrinkHint() {
      this.Shake = true;
      await new Promise((r) => setTimeout(r, 300));
      this.Shake = false;
    },
  },
};
</script>

<style scoped lang="scss">
.p100 {
  width: 100%;
}
.p50 {
  width: 50%;
}
.p0 {
  width: 0%;
}
.progressShake {
  animation: shake 0.3s infinite;
}
@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(5px);
  }
  75% {
    transform: translateX(-5px);
  }
  100% {
    transform: translateX(0);
  }
}
.Content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.Heart {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
.Heart p {
  font-size: 2rem;
  margin: 0;
}
</style>
