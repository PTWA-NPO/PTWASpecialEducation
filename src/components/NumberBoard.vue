<template>
  <!-- Your component's HTML template goes here -->
  <table class="number-board-container">
    <tr class="EachRow">
      <td v-for="unit in Unit" class="UnitEachBlanket">{{ unit }}</td>
    </tr>
    <tr class="EachRow">
      <td v-for="number in numbers" class="EachBlanket">{{ number }}</td>
    </tr>
  </table>
</template>

<script>
import { set } from "@vueuse/core";
export default {
  name: "NumberBoard",
  props: {
    Data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      numbers: [],
      Unit: null,
      putOnNumberArray: [],
    };
  },
  created() {
    // 如果單位和數字的長度不一樣，則補齊。
    this.Unit = this.Data.Unit;
    this.numbers = this.Data.Number;
    console.log(this.Data.Number);
    if (typeof this.Data.Number === "number") {
      this.numbers = this.Data.Number.toString().split("");
    }
    if (this.Data.Unit.length != this.numbers.length) {
      if (this.Data.Unit.length > this.numbers.length) {
        let diff = this.Data.Unit.length - this.numbers.length;
        for (let i = 0; i < diff; i++) {
          this.numbers.unshift(" ");
        }
      } else {
        let diff = this.numbers.length - this.Data.Unit.length;
        for (let i = 0; i < diff; i++) {
          this.Unit.unshift(" ");
        }
      }
    }
    console.log(this.numbers);
  },
};
</script>
<style scoped lang="scss">
/* Your component's CSS styles go here */

.number-board-container {
  border: solid;
  border-color: blue;
  display: grid;
  grid-template-rows: 1.5fr 1fr;
}
.EachRow {
  width: 100%;
  display: flex;
  justify-content: space-around;
  height: 100%;
  td {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    border: solid;
  }
}
</style>
