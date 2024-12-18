<template>
  <div class="Container">
    <p>Do not use this, this will be no longer to maintains</p>
    <div class="division">
      <p>{{ configs.Child }}</p>
      <hr />
      <p>{{ configs.Mother }}</p>
    </div>
    <div class="table-container">
      <div
        v-for="index in totalCells"
        :key="index"
        :class="['table-cell', { colored: coloredCells.includes(index - 1) }]"
        @click="toggleColor(index - 1)"
      >
        <img v-if="index <= configs.length" :src="Src" :alt="configs.Alt" />
      </div>
    </div>
  </div>
</template>

<script>
import { getGameAssets } from "@/utilitys/get_assets.js";
export default {
  name: "DrawImageTable",
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
  data() {
    return {
      coloredCells: [],
      Src: "",
      configs: {},
    };
  },
  computed: {
    totalCells() {
      // 確保總格子數量是 4 的倍數
      const rows = Math.ceil(this.configs.length / 4);
      return rows * 4;
    },
  },
  created() {
    this.configs = this.Data;
    this.configs.length = this.configs.Mother;
    this.Src = getGameAssets(this.ID, this.configs.Src);
  },
  methods: {
    toggleColor(index) {
      if (this.coloredCells.includes(index)) {
        this.coloredCells = this.coloredCells.filter((i) => i !== index);
      } else {
        this.coloredCells.push(index);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.Container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 100%;

  .division {
    width: 20%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    hr {
      width: 20px;
      border: solid;
    }
  }
  .table-container {
    width: 70%;
    border: solid #ccc;
    border-radius: 12px;
    padding: 1rem;
  }
}
.table-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.table-cell {
  position: relative;
  border: 1px solid #ccc;
  /* height: 150px; */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}

.table-cell img {
  max-width: 100%;
  max-height: 100%;
}

.table-cell.colored {
  background-color: rgba(0, 0, 255, 0.3); /* 藍色半透明 */
}

.table-cell.colored::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom right,
    transparent 49%,
    black 49%,
    black 51%,
    transparent 51%
  );
}
</style>
