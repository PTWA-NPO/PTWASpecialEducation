<template>
  <div class="simple-table__wrapper">
    <div v-if="title" class="simple-table__title">{{ title }}</div>
    <div class="simple-table" :style="gridStyle">
      <div
        v-for="(cell, index) in flatCells"
        :key="`cell-${index}`"
        class="simple-table__cell"
      >
        {{ cell }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SimpleTable",
  props: {
    componentConfig: {
      type: Object,
      required: true,
    },
  },
  computed: {
    title() {
      return this.componentConfig.title || "";
    },
    rows() {
      return Array.isArray(this.componentConfig.rows)
        ? this.componentConfig.rows
        : [];
    },
    columnCount() {
      return this.rows.reduce(
        (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
        0
      );
    },
    flatCells() {
      const cols = this.columnCount || 1;
      const cells = [];
      this.rows.forEach((row) => {
        const safeRow = Array.isArray(row) ? row : [];
        for (let i = 0; i < cols; i += 1) {
          cells.push(safeRow[i] ?? "");
        }
      });
      return cells;
    },
    gridStyle() {
      return {
        gridTemplateColumns: `repeat(${this.columnCount || 1}, minmax(80px, 1fr))`,
      };
    },
  },
};
</script>

<style scoped>
.simple-table__wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.simple-table__title {
  font-size: 1.5rem;
  text-align: center;
}
.simple-table {
  display: grid;
  gap: 6px;
  padding: 8px;
  border: 1px solid #c9c9c9;
  border-radius: 8px;
  background: #fff;
  width: fit-content;
}
.simple-table__cell {
  min-width: 120px;
  min-height: 60px;
  border: 1px solid #d6d6d6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
</style>
