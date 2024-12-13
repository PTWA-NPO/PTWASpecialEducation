<template>
  <div class="OutterContainer">
    <p v-if="configs.Text != undefined">{{ configs.Text }}{{ configs.Unit }}</p>
    <div v-else class="Number">
      <div class="Division">
        <p class="Child">
          {{ configs.Child }}
        </p>
        <hr class="fraction-line" />
        <p class="Mother">
          {{ configs.Mother }}
        </p>
      </div>
      <p>{{ configs.Unit }}</p>
    </div>
    <table class="OddBorderOutline">
      <tr v-for="(items, index1) in Drawed">
        <td
          v-for="(item, index2) in items"
          class="table"
          @click="handleClick($event, index1, index2)"
        />
      </tr>
    </table>
    <!-- <button @click="GetAnswer1">GetAnswer</button> -->
    <!-- {{ this.Drawed }} -->
  </div>
</template>
<script>
import TextOnly from "./TextOnly.vue";
export default {
  name: "CoulorBarChart",
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
      Drawed: [],
      container: null,
      configs: {},
    };
  },
  created() {
    this.configs = this.Data;
    this.configs.Total = this.configs.Mother;
    this.Drawed = [];
    if (this.configs.Total % 2 != 0) {
      //奇數
      let temp = [];
      for (var i = 0; i < this.configs.Total; i++) {
        temp.push(true);
      }
      console.log(temp);
      this.Drawed.push(temp);
    } else {
      //偶數
      let temp = [];
      let div = this.configs.Total / 2;
      for (var i = 0; i < 2; i++) {
        let temp = [];
        for (var x = 0; x < div; x++) {
          temp.push(true);
        }
        this.Drawed.push(temp);
      }
    }
  },
  mounted() {
    // Code to run when the component is mounted goes here
    let tableData = document.getElementsByClassName("table");
    let container = document.getElementsByClassName("OutterContainer");
    container = container[0].getBoundingClientRect();
    let width = container.width / this.configs.Total - 10;
    for (var i = 0; i < tableData.length; i++) {
      tableData[i].style.width = width + "px";
    }
    if (this.configs.Coulor == undefined) {
      this.configs.Coulor = "#bde0fe";
    }
  },
  methods: {
    handleClick($event, index1, index2) {
      this.Drawed[index1][index2] = !this.Drawed[index1][index2];
      if (this.Drawed[index1][index2]) {
        $event.target.style.backgroundColor = "white";
      } else {
        $event.target.style.backgroundColor = this.configs.Coulor;
      }
      this.GetAnswer();
    },
    GetAnswer() {
      let TempAnswer = 0;
      for (var i = 0; i < this.Drawed.length; i++) {
        for (var x = 0; x < this.Drawed[i].length; x++) {
          if (this.Drawed[i][x] == false) {
            TempAnswer += 1;
          }
        }
      }
      if (TempAnswer == this.configs.Child) {
        this.$emit("replyAnswer", true);
      } else {
        this.$emit("replyAnswer", false);
      }
    },
    GetAnswer1() {
      let TempAnswer = 0;
      for (var i = 0; i < this.Drawed.length; i++) {
        for (var x = 0; x < this.Drawed[i].length; x++) {
          if (this.Drawed[i][x] == false) {
            TempAnswer += 1;
          }
        }
      }
      if (TempAnswer == this.configs.Child) {
        alert("Correct" + TempAnswer + this.configs.Child);
      } else {
        alert("Incorrect" + TempAnswer + this.configs.Child);
      }
    },
  },
};
</script>
<style scoped lang="scss">
/* Your component's styles go here */
p {
  font-size: 2rem;
}
.OutterContainer {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .Number {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    .Division {
      display: inline-block;
      text-align: center;
      font-size: 2rem;
      line-height: 2; /* 設置行高 */
      vertical-align: middle; /* 垂直對齊 */
      .Child {
        margin: 0;
      }
      .Mother {
        margin: 0;
      }
      .fraction-line {
        margin: 0;
        border: none;
        border-top: 2px solid black;
        width: 2em;
      }
    }
  }
  .OddBorderOutline {
    border: solid;
    border-width: 2px;
    border-left: solid;
    border-right: solid;
    tr {
      border: solid;
    }
  }
  .table {
    border-style: dashed !important;
    height: 3rem;
    border-left: solid;
    background-color: #fff;
  }
}
</style>
