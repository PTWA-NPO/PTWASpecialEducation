<template>
  <div class="multiplication-table">
    <div class="table-header">
      <h4>九九乘法表</h4>
    </div>

    <div class="table-container">
      <div class="multiplication-grid">
        <div
          v-for="i in 9"
          :key="`row-${i}`"
          class="table-row"
          :class="{ 'highlight-row': selectedRow === i }"
        >
          <div
            v-for="j in 9"
            :key="`cell-${i}-${j}`"
            class="table-cell"
            :class="{
              'highlight-cell': selectedRow === i || selectedCol === j,
              selected: selectedRow === i && selectedCol === j,
            }"
            @click="selectCell(i, j)"
            @mouseenter="hoverCell(i, j)"
            @mouseleave="clearHover"
          >
            {{ i }} × {{ j }} = {{ i * j }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MultiplicationTable",
  data() {
    return {
      selectedRow: null,
      selectedCol: null,
    };
  },
  methods: {
    selectCell(row, col) {
      this.selectedRow = row;
      this.selectedCol = col;
    },
    hoverCell(row, col) {
      this.selectedRow = row;
      this.selectedCol = col;
    },
    clearHover() {
      this.selectedRow = null;
      this.selectedCol = null;
    },
  },
};
</script>

<style scoped>
.multiplication-table {
  width: 100%;
  height: 100%;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
}
.table-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  flex-shrink: 0;
}
.table-header h4 {
  margin: 0;
  color: #495057;
  font-size: 1.5rem;
}
.table-container {
  flex: 1;
  overflow: auto;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  background: white;
}
.multiplication-grid {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 10px;
}
.table-row {
  display: flex;
  gap: 1px;
}
.table-cell {
  min-width: 80px;
  padding: 8px 6px;
  background: #f8f9fa;
  border-radius: 3px;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.85rem;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.table-cell.highlight-cell {
  background: #ffe082;
}
.table-cell.selected {
  background: #ffd600;
  font-weight: bold;
}
.table-cell:hover {
  background: #e3f2fd;
}
</style>
