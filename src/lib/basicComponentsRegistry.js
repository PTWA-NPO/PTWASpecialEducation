import { defineAsyncComponent } from "vue";

export const basicComponents = {
  TextOnly: defineAsyncComponent(() => import("@/components/TextOnly.vue")),
  MarkdownRenderer: defineAsyncComponent(
    () => import("@/components/MarkdownRenderer.vue")
  ),
  NumberLine: defineAsyncComponent(
    () => import("@/components/NumberLine.vue")
  ),
  NumberLineWithBlank: defineAsyncComponent(
    () => import("@/components/NumberLineWithBlank.vue")
  ),
  DragOnNumberLine: defineAsyncComponent(
    () => import("@/components/DragOnNumberLine.vue")
  ),
  ImageContainer: defineAsyncComponent(
    () => import("@/components/ImageContainer.vue")
  ),
  InteractiveMathEquation: defineAsyncComponent(
    () => import("@/components/InteractiveMathEquation.vue")
  ),
  RepeatImage: defineAsyncComponent(
    () => import("@/components/RepeatImage.vue")
  ),
  DragImages: defineAsyncComponent(
    () => import("@/components/DragImages.vue")
  ),
  NumberBoard: defineAsyncComponent(
    () => import("@/components/NumberBoard.vue")
  ),
  FractionForAnswer: defineAsyncComponent(
    () => import("@/components/FractionForAnswer.vue")
  ),
  NumberLineVisualizer: defineAsyncComponent(
    () => import("@/components/NumberLineVisualizer.vue")
  ),
  ThreeRowNumberBoard: defineAsyncComponent(
    () => import("@/components/ThreeRowNumberBoard.vue")
  ),
  MoneyGenerator: defineAsyncComponent(
    () => import("@/components/MoneyGenerator.vue")
  ),
};

export default basicComponents;
