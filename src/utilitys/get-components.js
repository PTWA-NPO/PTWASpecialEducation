// 在你的 get-components.js 文件中
import { defineAsyncComponent } from "vue";
const componentsMapping = {
  ImageContainer: () => import("@/components/ImageContainer.vue"),
  ImageWithText: () => import("@/components/ImageWithText.vue"),
  TextOnly: () => import("@/components/TextOnly.vue"),
  CoulorBarChart: () => import("@/components/CoulorBarChart.vue"),
  CircleChart: () => import("@/components/CircleChart.vue"),
  ImageTable: () => import("@/components/DrawImageTable.vue"),
  DrawImage: () => import("@/components/DrawImage.vue"),
  NumberBoard: () => import("@/components/NumberBoard.vue"),
  AnalogClock: () => import("@/components/AnalogClock.vue"),
  MarkdownRenderer: () => import("@/components/MarkdownRenderer.vue"),
  WaterDisplay: () => import("@/components/WaterDisplay.vue"),
  MoneyGenerator: () => import("@/components/MoneyGenerator.vue"),
  CardWithButton: () => import("@/components/CardWithButton.vue"),
  MoneyDisplay: () => import("@/components/MoneyDisplay.vue"),
  ScalePointer: () => import("@/components/ScalePointer.vue"),
  NumberIncrementor: () => import("@/components/NumberIncrementor.vue"),
  InteractiveMathEquation: () =>
    import("@/components/InteractiveMathEquation.vue"),
  FloatNumPad: () => import("@/components/FloatNumPad.vue"),
  DragImages: () => import("@/components/DragImages.vue"),
  FractionDisplay: () => import("@/components/FractionDisplay.vue"),
  CalculationBoard: () => import("@/components/CalculationBoard.vue"),
};
export function GetComponents(name) {
  console.warn(
    "GetComponents is deprecated, please use getComponents instead."
  );
  return componentsMapping[name]
    ? defineAsyncComponent(componentsMapping[name])
    : null;
}

export function getComponents(name) {
  return componentsMapping[name]
    ? defineAsyncComponent(componentsMapping[name])
    : null;
}
