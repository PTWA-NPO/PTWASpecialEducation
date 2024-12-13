<template>
  <div class="container">
    <!-- Your component's HTML template goes here -->
    <div class="row mt-2">
      <!-- Number buttons -->
      <div class="row">
        <div class="col-12 mb-2">
          <input
            id="keyboardInput"
            v-model="Num"
            type="text"
            class="form-control rtl-input"
            readonly
          />
        </div>
      </div>
      <div class="row">
        <div class="col-4 mb-2">
          <button
            id="num1"
            class="btn btn-secondary w-100 responsive-width"
            @click="input('1')"
          >
            1
          </button>
        </div>
        <div class="col-4 mb-2">
          <button
            id="num2"
            class="btn btn-secondary w-100 responsive-width"
            @click="input('2')"
          >
            2
          </button>
        </div>
        <div class="col-4 mb-2">
          <button
            id="num3"
            class="btn btn-secondary w-100 responsive-width"
            @click="input('3')"
          >
            3
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col-4 mb-2">
          <button
            id="num4"
            class="btn btn-secondary w-100 responsive-width"
            @click="input('4')"
          >
            4
          </button>
        </div>
        <div class="col-4 mb-2">
          <button
            id="num5"
            class="btn btn-secondary w-100 responsive-width"
            @click="input('5')"
          >
            5
          </button>
        </div>
        <div class="col-4 mb-2">
          <button
            id="num6"
            class="btn btn-secondary w-100 responsive-width"
            @click="input('6')"
          >
            6
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col-4 mb-2">
          <button
            id="num7"
            class="btn btn-secondary w-100 responsive-width"
            @click="input('7')"
          >
            7
          </button>
        </div>
        <div class="col-4 mb-2">
          <button
            id="num8"
            class="btn btn-secondary w-100 responsive-width"
            @click="input('8')"
          >
            8
          </button>
        </div>
        <div class="col-4 mb-2">
          <button
            id="num9"
            class="btn btn-secondary w-100 responsive-width"
            @click="input('9')"
          >
            9
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col-4 mb-2">
          <button
            id="backspace"
            class="btn btn-danger w-100 responsive-width text-nowrap"
            @click="delete_num()"
          >
            清除
          </button>
        </div>
        <div class="col-4 mb-2">
          <button id="num0" class="btn btn-secondary w-100" @click="input('0')">
            0
          </button>
        </div>
        <div class="col-4 mb-2">
          <button
            id="submit"
            class="btn btn-success w-100 responsive-width text-nowrap"
            @click="submit()"
          >
            送出
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "VirtualNumPad",
  emits: ["submit"],
  data() {
    return {
      Num: "",
    };
  },
  methods: {
    input(num) {
      this.Num += num;
    },
    delete_num() {
      this.Num = "";
    },
    submit() {
      this.$emit("submit", this.Num);
      console.log("Virtual NumPad Sent Num" + this.Num + " to parent");
    },
  },
};
</script>

<style scoped lang="scss">
.rtl-input {
  direction: rtl; /* 文字方向從右到左 */
  text-align: right; /* 文字對齊到右邊 */
}
.responsive-width {
  /* font-size: 90%; */
  text-align: center;
}
</style>
