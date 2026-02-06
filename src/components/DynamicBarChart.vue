<template>
  <div class="dynamic-bar-chart">
    <div class="dynamic-bar-chart__chart-title">
      <template v-if="isBlankTitle">
        <select v-model="answers.title" @change="emitAnswer">
          <option value="" disabled>
            {{ instructionText("step1", "填上長條圖的標題") }}
          </option>
          <option :value="config.Title">{{ config.Title }}</option>
        </select>
      </template>
      <template v-else>{{ config.Title }}</template>
    </div>

    <div v-if="hasBlankValueQuestion" class="dynamic-bar-chart__step5-title">
      {{ instructionText("step5", "分別依據統計的項目和數量，畫出長條") }}
    </div>

    <div class="dynamic-bar-chart__chart-area">
      <div class="dynamic-bar-chart__y-axis-label">
        <template v-if="isBlankAxis">
          <select v-model="answers.yLabel" @change="emitAnswer">
            <option value="" disabled>
              {{ instructionText("step3", "填上縱軸表示什麼及單位") }}
            </option>
            <option :value="config.Axis.X">{{ config.Axis.X }}</option>
            <option :value="config.Axis.Y">{{ config.Axis.Y }}</option>
          </select>
        </template>
        <template v-else>{{ config.Axis.Y }}</template>
      </div>

      <div v-if="hasBlankYTickQuestion" class="dynamic-bar-chart__step4-between">
        {{ instructionText("step4", "填上縱軸標示刻度代表的數量") }}
      </div>

      <div class="dynamic-bar-chart__grid">
        <div class="dynamic-bar-chart__y-ticks" :style="yTicksStyle">
          <div
            v-for="(tick, index) in yTickItems"
            :key="`tick-${index}`"
            class="dynamic-bar-chart__y-tick"
            :style="{ top: `${tick.top}px` }"
          >
            <template v-if="isBlankYTick(index)">
              <div class="dynamic-bar-chart__y-tick-input">
                <select v-model="answers.yTicks[index]" @change="emitAnswer">
                  <option value="" disabled>請選擇</option>
                  <option
                    v-for="option in yTicksOptions"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </div>
            </template>
            <template v-else>{{ tick.label }}</template>
          </div>
        </div>

        <div class="dynamic-bar-chart__bars">
          <div class="dynamic-bar-chart__bars-grid" :style="barsGridStyle">
            <div
              v-for="(value, index) in values"
              :key="`bar-${index}`"
              class="dynamic-bar-chart__bar-column"
            >
              <div
                class="dynamic-bar-chart__bar-stack"
                :class="{
                  'dynamic-bar-chart__bar-stack--draggable': isBlankValue(index),
                  'dynamic-bar-chart__bar-stack--dragging':
                    dragState.active && dragState.index === index,
                }"
                :style="barStackStyle"
                @pointerdown.prevent="startDragValue(index, $event)"
              >
                <div class="dynamic-bar-chart__bar-fill" :style="barFillStyle(index)" />
              </div>
              <div class="dynamic-bar-chart__x-item">
                <template v-if="isBlankXItem(index)">
                  <select v-model="answers.xItems[index]" @change="emitAnswer">
                    <option value="" disabled>
                      {{ instructionText("step2", "填上種類名稱") }}
                    </option>
                    <option v-for="option in xItems" :key="option">
                      {{ option }}
                    </option>
                  </select>
                </template>
                <template v-else>{{ xItems[index] }}</template>
              </div>
            </div>
          </div>
          <div class="dynamic-bar-chart__x-axis-label">
            <template v-if="isBlankAxis">
              <select v-model="answers.xLabel" @change="emitAnswer">
                <option value="" disabled>
                  {{ instructionText("step2", "填上橫軸表示什麼") }}
                </option>
                <option :value="config.Axis.X">{{ config.Axis.X }}</option>
                <option :value="config.Axis.Y">{{ config.Axis.Y }}</option>
              </select>
            </template>
            <template v-else>{{ config.Axis.X }}</template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DynamicBarChart",
  props: {
    componentConfig: {
      type: Object,
      required: true,
    },
  },
  emits: ["replyAnswer"],
  data() {
    return {
      answers: {
        title: "",
        xLabel: "",
        yLabel: "",
        xItems: [],
        yTicks: [],
        values: [],
      },
      dragState: {
        active: false,
        index: -1,
        bottom: 0,
      },
    };
  },
  computed: {
    config() {
      return this.componentConfig;
    },
    xItems() {
      return Array.isArray(this.config.XItems) ? this.config.XItems : [];
    },
    values() {
      return Array.isArray(this.config.Values) ? this.config.Values : [];
    },
    rowHeight() {
      return Number(this.config.RowHeight || 24);
    },
    rowGap() {
      return Number(this.config.RowGap || 4);
    },
    barWidth() {
      return Number(this.config.BarWidth || 120);
    },
    barGap() {
      return Number(this.config.BarGap ?? 0);
    },
    rowCount() {
      const maxRows = Number(this.config.Y || 0);
      if (maxRows > 0) return Math.max(1, Math.floor(maxRows));
      if (Array.isArray(this.config.YTicks) && this.config.YTicks.length) {
        return this.config.YTicks.length;
      }
      return 1;
    },
    tickStep() {
      if (Array.isArray(this.config.YTicks) && this.config.YTicks.length >= 2) {
        const ticksAsc = [...this.config.YTicks].map(Number).sort((a, b) => a - b);
        return Math.max(1, ticksAsc[1] - ticksAsc[0]);
      }
      return 1;
    },
    maxValue() {
      if (Array.isArray(this.config.YTicks) && this.config.YTicks.length) {
        return Math.max(...this.config.YTicks.map((tick) => Number(tick)));
      }
      return Number(this.config.Y || 0);
    },
    yTicksAsc() {
      if (Array.isArray(this.config.YTicks) && this.config.YTicks.length) {
        return this.config.YTicks.slice(0, this.rowCount + 1);
      }
      return Array.from({ length: this.rowCount + 1 }, (_, i) => i);
    },
    yTicksOptions() {
      return [...this.yTicksAsc].reverse();
    },
    chartHeight() {
      const rows = this.rowCount || 1;
      if (Array.isArray(this.config.YTicks) && this.config.YTicks.length) {
        return rows * (this.rowHeight + this.rowGap);
      }
      return rows * this.rowHeight + (rows - 1) * this.rowGap;
    },
    yTickItems() {
      const rows = this.rowCount || 1;
      const ticksAsc = [...this.yTicksAsc].sort((a, b) => a - b);
      const step = this.rowHeight + this.rowGap;
      const items = [];
      for (let i = 0; i <= rows; i += 1) {
        const top = this.chartHeight - i * step;
        items.push({ label: ticksAsc[i], top });
      }
      return items;
    },
    barsGridStyle() {
      const count = this.xItems.length || this.config.X || 1;
      return {
        gridTemplateColumns: `repeat(${count}, ${this.barWidth}px)`,
        gap: `${this.barGap}px`,
        justifyContent: "center",
      };
    },
    barStackStyle() {
      return {
        height: `${this.chartHeight}px`,
        width: `${this.barWidth}px`,
        "--row-height": `${this.rowHeight}px`,
        "--row-gap": `${this.rowGap}px`,
      };
    },
    yTicksStyle() {
      return {
        height: `${this.chartHeight}px`,
        "--row-height": `${this.rowHeight}px`,
        "--row-gap": `${this.rowGap}px`,
      };
    },
    questionRules() {
      const rules = {
        title: false,
        axis: false,
        XItems: new Set(),
        YTicks: new Set(),
        Values: new Set(),
      };
      const source = this.config.AsQuestions;

      const addIndexed = (target, list) => {
        if (!Array.isArray(list)) return;
        list.forEach((value) => {
          const num = Number(value);
          if (Number.isInteger(num) && num > 0) target.add(num);
        });
      };

      const applyLegacyToken = (token) => {
        if (token === "1") rules.title = true;
        else if (token === "2") rules.axis = true;
        else if (typeof token === "string") {
          const match = token.match(/^([345])\.(\d+)$/);
          if (!match) return;
          const idx = Number(match[2]);
          if (!Number.isInteger(idx) || idx <= 0) return;
          if (match[1] === "3") rules.XItems.add(idx);
          if (match[1] === "4") rules.YTicks.add(idx);
          if (match[1] === "5") rules.Values.add(idx);
        }
      };

      const applyNamedObject = (obj) => {
        if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
        if (obj.title === true) rules.title = true;
        if (obj.axis === true) rules.axis = true;
        addIndexed(rules.XItems, obj.XItems ?? obj.xItems);
        addIndexed(rules.YTicks, obj.YTicks ?? obj.yTicks);
        addIndexed(rules.Values, obj.Values ?? obj.values);
      };

      if (Array.isArray(source)) {
        source.forEach((item) => {
          if (typeof item === "string") {
            if (item === "title") rules.title = true;
            else if (item === "axis") rules.axis = true;
            else applyLegacyToken(item);
            return;
          }
          applyNamedObject(item);
        });
      } else if (source && typeof source === "object") {
        applyNamedObject(source);
      }

      return rules;
    },
    isBlankTitle() {
      return this.questionRules.title;
    },
    isBlankAxis() {
      return this.questionRules.axis;
    },
    hasBlankYTickQuestion() {
      return this.yTicksAsc.some((_, index) => this.isBlankYTick(index));
    },
    hasBlankXItemQuestion() {
      return this.xItems.some((_, index) => this.isBlankXItem(index));
    },
    hasBlankValueQuestion() {
      return this.values.some((_, index) => this.isBlankValue(index));
    },
    instructionNumberByStep() {
      const orderedSteps = [];
      if (this.isBlankTitle) orderedSteps.push("step1");
      if (this.isBlankAxis || this.hasBlankXItemQuestion) orderedSteps.push("step2");
      if (this.isBlankAxis) orderedSteps.push("step3");
      if (this.hasBlankYTickQuestion) orderedSteps.push("step4");
      if (this.hasBlankValueQuestion) orderedSteps.push("step5");
      return orderedSteps.reduce((acc, step, index) => {
        acc[step] = index + 1;
        return acc;
      }, {});
    },
  },
  created() {
    this.answers.xItems = Array(this.xItems.length).fill("");
    this.answers.yTicks = Array(this.yTicksAsc.length).fill("");
    this.answers.values = this.values.map(() => 0);
  },
  beforeUnmount() {
    this.stopDragListeners();
  },
  methods: {
    isBlankXItem(index) {
      return this.questionRules.XItems.has(index + 1);
    },
    isBlankYTick(index) {
      return this.questionRules.YTicks.has(index + 1);
    },
    isBlankValue(index) {
      return this.questionRules.Values.has(index + 1);
    },
    displayValue(index) {
      const raw = this.isBlankValue(index)
        ? this.answers.values[index]
        : this.values[index];
      const max = this.maxValue;
      return Math.min(max, Math.max(0, Number(raw)));
    },
    barFillStyle(index) {
      const value = this.displayValue(index);
      const max = this.maxValue;
      const stepHeight = (this.rowHeight + this.rowGap) / this.tickStep;
      const height = max > 0 ? Math.min(this.chartHeight, value * stepHeight) : 0;
      const hasHeight = height > 0;
      const colors = [
        "#5DADE2",
        "#58D68D",
        "#F4D03F",
        "#F1948A",
        "#AF7AC5",
        "#45B39D",
      ];
      const strokeColors = [
        "#3B7FB3",
        "#2E9E6B",
        "#C9A326",
        "#D46A5F",
        "#8E5EAA",
        "#2E8C79",
      ];
      const colorIndex = index % colors.length;
      return {
        height: `${height}px`,
        width: `${this.barWidth * 0.7}px`,
        borderWidth: hasHeight ? "1px" : "0",
        background: colors[colorIndex],
        borderColor: strokeColors[colorIndex],
      };
    },
    startDragValue(index, event) {
      if (!this.isBlankValue(index)) return;
      const rect = event.currentTarget.getBoundingClientRect();
      this.dragState = {
        active: true,
        index,
        bottom: rect.bottom,
      };
      this.applyDraggedValue(index, event.clientY);
      window.addEventListener("pointermove", this.onDragValueMove);
      window.addEventListener("pointerup", this.stopDragValue);
      window.addEventListener("pointercancel", this.stopDragValue);
    },
    onDragValueMove(event) {
      if (!this.dragState.active) return;
      this.applyDraggedValue(this.dragState.index, event.clientY);
    },
    stopDragListeners() {
      window.removeEventListener("pointermove", this.onDragValueMove);
      window.removeEventListener("pointerup", this.stopDragValue);
      window.removeEventListener("pointercancel", this.stopDragValue);
    },
    stopDragValue() {
      if (!this.dragState.active) return;
      this.stopDragListeners();
      this.dragState.active = false;
      this.dragState.index = -1;
      this.dragState.bottom = 0;
    },
    applyDraggedValue(index, clientY) {
      const stepHeight = (this.rowHeight + this.rowGap) / this.tickStep;
      const max = this.maxValue;
      const relativeY = this.dragState.bottom - clientY;
      const pixels = Math.min(this.chartHeight, Math.max(0, relativeY));
      const nextValue = Math.min(max, Math.max(0, Math.round(pixels / stepHeight)));
      if (this.answers.values[index] === nextValue) return;
      this.answers.values[index] = nextValue;
      this.emitAnswer();
    },
    instructionText(step, text) {
      const number = this.instructionNumberByStep[step];
      return number ? `${number}.${text}` : text;
    },
    emitAnswer() {
      const checks = [];
      if (this.isBlankTitle) checks.push(this.answers.title === this.config.Title);
      if (this.isBlankAxis) {
        checks.push(this.answers.xLabel === this.config.Axis.X);
        checks.push(this.answers.yLabel === this.config.Axis.Y);
      }

      this.xItems.forEach((item, index) => {
        if (this.isBlankXItem(index)) {
          checks.push(this.answers.xItems[index] === item);
        }
      });
      this.yTicksAsc.forEach((tick, index) => {
        if (this.isBlankYTick(index)) {
          checks.push(String(this.answers.yTicks[index]) === String(tick));
        }
      });
      this.values.forEach((value, index) => {
        if (this.isBlankValue(index)) {
          checks.push(Number(this.answers.values[index]) === Number(value));
        }
      });
      const isCorrect = checks.length ? checks.every(Boolean) : true;
      this.$emit("replyAnswer", isCorrect);
    },
  },
};
</script>

<style scoped>
.dynamic-bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}
.dynamic-bar-chart__step5-title {
  width: 100%;
  text-align: center;
}
.dynamic-bar-chart__chart-title {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 12px;
}
.dynamic-bar-chart__chart-area {
  display: flex;
  gap: 0px;
  align-items: flex-start;
  justify-content: center;
}
.dynamic-bar-chart__y-axis-label {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 1.1rem;
  align-self: flex-start;
  transform: translate(-60px, 0);
}
.dynamic-bar-chart__step4-between {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 0.95rem;
  transform: translate(-52px, 0);
}
.dynamic-bar-chart__grid {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
}
.dynamic-bar-chart__y-ticks {
  position: relative;
  min-width: 40px;
  overflow: visible;
}
.dynamic-bar-chart__y-tick {
  text-align: right;
  font-size: 0.95rem;
  position: absolute;
  right: 0;
  transform: translateY(-50%);
  white-space: nowrap;
  line-height: 1;
}
.dynamic-bar-chart__y-tick-input {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dynamic-bar-chart__bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}
.dynamic-bar-chart__bars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
  justify-content: center;
  width: fit-content;
}
.dynamic-bar-chart__bar-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.dynamic-bar-chart__bar-stack {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  background-image: linear-gradient(to top, #e6e6e6 1px, transparent 1px);
  background-size: 100% calc(var(--row-height) + var(--row-gap));
  background-position: bottom left;
  border: 1px solid #d0d0d0;
  box-sizing: border-box;
}
.dynamic-bar-chart__bar-stack--draggable {
  cursor: ns-resize;
  touch-action: none;
}
.dynamic-bar-chart__bar-stack--dragging {
  border-color: #5dade2;
}
.dynamic-bar-chart__bar-fill {
  background: #5dade2;
  border: 1px solid #3b7fb3;
  box-sizing: border-box;
  margin: 0 auto;
}
.dynamic-bar-chart__x-item {
  font-size: 0.95rem;
  text-align: center;
}
.dynamic-bar-chart__x-axis-label {
  font-size: 1.1rem;
  text-align: right;
  width: fit-content;
  align-self: flex-end;
}
select {
  font-size: 0.95rem;
}
</style>
