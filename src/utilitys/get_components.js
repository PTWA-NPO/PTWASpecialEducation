import { defineAsyncComponent } from "vue";

const componentsMapping = {
    ImageContainer: defineAsyncComponent(() => import('@/components/ImageContainer.vue')),
    ImageWithText: defineAsyncComponent(() => import('@/components/ImageWithText.vue')),
    TextOnly: defineAsyncComponent(() => import('@/components/TextOnly.vue')),
    CoulorBarChart: defineAsyncComponent(() => import('@/components/CoulorBarChart.vue')),
    CircleChart: defineAsyncComponent(() => import('@/components/CircleChart.vue')),
    ImageTable: defineAsyncComponent(() => import('@/components/DrawImageTable.vue')),
    DrawImage: defineAsyncComponent(() => import('@/components/DrawImage.vue')),
    NumberBoard: defineAsyncComponent(() => import('@/components/NumberBoard.vue')),
    Numpad: defineAsyncComponent(() => import('@/components/VirtualNumPadInput.vue')),
    Calculator: defineAsyncComponent(() => import('@/components/Calculator.vue')),
    Clock: defineAsyncComponent(() => import('@/components/Clock.vue')),
    VirtualNumPad: defineAsyncComponent(() => import('@/components/VirtualNumPad.vue')),
    Input: defineAsyncComponent(() => import('@/components/ReplyInput.vue')),
    Fractions: defineAsyncComponent(() => import('@/components/Fractions.vue')),
    Markdown: defineAsyncComponent(() => import('@/components/Markdown.vue')),
    Water: defineAsyncComponent(() => import('@/components/Water.vue')),
    MoneyGenerator: defineAsyncComponent(() => import('@/components/MoneyGenerator.vue')),
    CardWithButton: defineAsyncComponent(() => import('@/components/CardWithButton.vue')),
}

export function GetComponents(name) {
  return componentsMapping[name] || null;
}

export function getComponents(name) {
  return componentsMapping[name] || null;
}
