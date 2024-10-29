// 在你的 get-components.js 文件中
import { defineAsyncComponent } from 'vue'
const componentsMapping = {
    ImageContainer: () => import('@/components/ImageContainer.vue'),
    ImageWithText: () => import('@/components/ImageWithText.vue'),
    TextOnly: () => import('@/components/TextOnly.vue'),
    CoulorBarChart: () => import('@/components/CoulorBarChart.vue'),
    CircleChart: () => import('@/components/CircleChart.vue'),
    ImageTable: () => import('@/components/DrawImageTable.vue'),
    DrawImage: () => import('@/components/DrawImage.vue'),
    NumberBoard: () => import('@/components/NumberBoard.vue'),
    Numpad: () => import('@/components/VirtualNumPadInput.vue'),
    Calculator: () => import('@/components/calculator.vue'),
    Clock: () => import('@/components/Clock.vue'),
    VirtualNumPad: () => import('@/components/VirtualNumPad.vue'),
    Input: () => import('@/components/ReplyInput.vue'),
    Fractions: () => import('@/components/Fractions.vue'),
    Markdown: () => import('@/components/Markdown.vue'),
    NumberLine: () => import('@/components/NumberLineV2.vue'),
    Water: () => import('@/components/Water.vue'),
    MoneyGenerator: () => import('@/components/MoneyGenerator.vue'),
    CardWithButton: () => import('@/components/CardWithButton.vue'),
}
export function GetComponents(name) {
    return componentsMapping[name] ? defineAsyncComponent(componentsMapping[name]) : null
}

export function getComponents(name) {
    return componentsMapping[name] ? defineAsyncComponent(componentsMapping[name]) : null
}