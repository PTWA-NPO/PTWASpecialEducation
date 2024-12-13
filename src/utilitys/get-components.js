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
  Numpad: () => import("@/components/VirtualNumPadInput.vue"),
  Calculator: () => import("@/components/Calculator.vue"),
  Clock: () => import("@/components/Clock.vue"),
  VirtualNumPad: () => import("@/components/VirtualNumPad.vue"),
  Fractions: () => import("@/components/Fractions.vue"),
  Markdown: () => import("@/components/Markdown.vue"),
  Water: () => import("@/components/Water.vue"),
  MoneyGenerator: () => import("@/components/MoneyGenerator.vue"),
  CardWithButton: () => import("@/components/CardWithButton.vue"),
  MoneyDisplay: () => import("@/components/MoneyDisplay.vue"),
  Scale: () => import("@/components/Scale.vue"),
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
