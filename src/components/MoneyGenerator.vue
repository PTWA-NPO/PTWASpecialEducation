<template>
  <div
    ref="Container"
    class="Container"
    :style="{
      width: containerSize.width + 'px',
      height: containerSize.height + 'px',
    }"
  >
    <div
      v-if="paperMoneyGroups['10000'].length > 0"
      :key="containerRef"
      class="MoneyContainer papaer-money"
      :style="{ gridTemplateColumns: 'repeat(' + paperMoneyCols + ', 1fr)' }"
    >
      <MoneyDisplay
        v-for="(item, index) in paperMoneyGroups['10000']"
        :key="`10000-${index}`"
        :component-config="{ denomination: item }"
      />
    </div>
    <div
      v-if="paperMoneyGroups['1000'].length > 0"
      :key="containerRef"
      class="MoneyContainer papaer-money"
      :style="{ gridTemplateColumns: 'repeat(' + paperMoneyCols + ', 1fr)' }"
    >
      <MoneyDisplay
        v-for="(item, index) in paperMoneyGroups['1000']"
        :key="`1000-${index}`"
        :component-config="{ denomination: item }"
      />
    </div>
    <div
      v-if="paperMoneyGroups['500'].length > 0"
      :key="containerRef"
      class="MoneyContainer papaer-money"
      :style="{ gridTemplateColumns: 'repeat(' + paperMoneyCols + ', 1fr)' }"
    >
      <MoneyDisplay
        v-for="(item, index) in paperMoneyGroups['500']"
        :key="`500-${index}`"
        :component-config="{ denomination: item }"
      />
    </div>
    <div
      v-if="paperMoneyGroups['100'].length > 0"
      :key="containerRef"
      class="MoneyContainer papaer-money"
      :style="{ gridTemplateColumns: 'repeat(' + paperMoneyCols + ', 1fr)' }"
    >
      <MoneyDisplay
        v-for="(item, index) in paperMoneyGroups['100']"
        :key="`100-${index}`"
        :component-config="{ denomination: item }"
      />
    </div>
    <div
      v-for="(item, rowIndex) in coinContainer"
      :key="'row-' + rowIndex"
      class="CoinContainer"
    >
      <div
        v-for="(coin, coinIndex) in item"
        :key="'coin-' + coinIndex"
        class="PerCoin"
      >
        <MoneyDisplay
          v-if="coin !== ''"
          :component-config="{ denomination: coin }"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick } from "vue";
import MoneyDisplay from "./MoneyDisplay.vue";

const props = defineProps({
  componentConfig: {
    type: Object,
    required: true,
  },
});

const paperMoneyGroups = ref({
  10000: [],
  1000: [],
  500: [],
  100: [],
});
const coinContainer = ref([]);
const componentConfig = ref(props.componentConfig);
const containerSize = ref(false);
const containerRef = ref(0);
const Container = ref(null);

const paperMoneyCols = ref(5);

const processCoins = (amount, denomination) => {
  let remaining = amount;
  while (remaining > 0) {
    const TempContainer = [];
    const count = Math.min(remaining, 10);
    for (let i = 0; i < count; i++) {
      TempContainer.push(denomination);
    }
    // Remove fixed padding here to allow dynamic resizing later
    coinContainer.value.push(TempContainer);
    remaining -= count;
  }
};

const processPaperMoney = (amount, denomination) => {
  for (let i = 0; i < amount; i++) {
    paperMoneyGroups.value[denomination].push(denomination);
  }
};

const loadData = () => {
  // 處理紙鈔
  if (componentConfig.value.TenThousands) {
    processPaperMoney(componentConfig.value.TenThousands, "10000");
  }
  if (componentConfig.value.Thousands) {
    processPaperMoney(componentConfig.value.Thousands, "1000");
  }
  if (componentConfig.value.FiveHundreds) {
    processPaperMoney(componentConfig.value.FiveHundreds, "500");
  }
  if (componentConfig.value.Hundreds) {
    processPaperMoney(componentConfig.value.Hundreds, "100");
  }

  // Calculate paper money columns
  const maxPaperCount = Math.max(
    paperMoneyGroups.value["10000"].length,
    paperMoneyGroups.value["1000"].length,
    paperMoneyGroups.value["500"].length,
    paperMoneyGroups.value["100"].length
  );
  paperMoneyCols.value = maxPaperCount > 0 ? Math.min(maxPaperCount, 5) : 5;

  // 處理硬幣
  const coinTypes = {
    Fifties: "50",
    Tens: "10",
    Fives: "5",
    Ones: "1",
  };

  Object.entries(coinTypes).forEach(([key, value]) => {
    if (componentConfig.value[key]) {
      processCoins(componentConfig.value[key], value);
    }
  });

  // Post-process coins to pad to the maximum length found
  if (coinContainer.value.length > 0) {
    const maxCoinLen = Math.max(
      ...coinContainer.value.map((row) => row.length)
    );
    coinContainer.value.forEach((row) => {
      while (row.length < maxCoinLen) {
        row.push("");
      }
    });
  }
};
function updateContainerSize() {
  if (Container.value) {
    const { width, height } = Container.value.getBoundingClientRect();
    containerSize.value = { width, height };
  }
}
onMounted(() => {
  Container.value.focus();
  loadData();
  updateContainerSize();
  window.addEventListener("resize", updateContainerSize);
  // Use nextTick to ensure the container size is updated before initializing the image
  nextTick(() => {
    containerRef.value += 1;
  });
});
</script>
<style scoped lang="scss">
/* Your component styles here */
.Container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}
.papaer-money {
  flex: 0 1 auto;
  min-height: 0;
}
.MoneyContainer {
  display: grid;
  // grid-template-columns is handled by inline style
  grid-auto-rows: 1fr;
  gap: 10px;
}
.CoinContainer {
  display: flex;
  flex-direction: row;
  width: 100%;
  max-height: 48px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .PerCoin {
    display: flex;
    justify-content: end;
    align-items: end;
  }
}
</style>
