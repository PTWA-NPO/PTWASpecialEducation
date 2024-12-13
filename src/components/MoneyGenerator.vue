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
      v-if="Data.Thousands || Data.FiveHundreds"
      :key="containerRef"
      class="Up MoneyContainer papaer-money"
    >
      <img v-for="item in UpContainer" :src="item" />
    </div>
    <div
      v-if="Data.Hundreds"
      :key="containerRef"
      class="Middle MoneyContainer papaer-money"
    >
      <img v-for="item in MiddleContainer" :src="item" />
    </div>
    <div v-for="item in DownContainer" class="Down CoinContainer">
      <div v-for="coin in item" class="PerCoin">
        <img v-if="coin != ''" :src="coin" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { getSlotComponentAssets } from "../utilitys/get_assets";
import { ref, onMounted, nextTick } from "vue";

const props = defineProps({
  Data: {
    type: Object,
    required: true,
  },
  ID: {
    type: String,
    required: true,
  },
});

const UpContainer = ref([]);
const MiddleContainer = ref([]);
const DownContainer = ref([]);
const Data = ref(props.Data);
const containerSize = ref(false);
const containerRef = ref(0);
const Container = ref(null);

const loadData = () => {
  if (Data.value.Thousands) {
    for (let i = 0; i < Data.value.Thousands; i++) {
      UpContainer.value.push(
        getSlotComponentAssets("MoneyGenerator", "1000.png")
      );
    }
  }
  if (Data.value.FiveHundreds) {
    for (let i = 0; i < Data.value.FiveHundreds; i++) {
      UpContainer.value.push(
        getSlotComponentAssets("MoneyGenerator", "500.png")
      );
    }
  }

  if (Data.value.Hundreds) {
    for (let i = 0; i < Data.value.Hundreds; i++) {
      MiddleContainer.value.push(
        getSlotComponentAssets("MoneyGenerator", "100.png")
      );
    }
  }
  let RowIndex = 0;
  let Cnt = 0;
  let TempContainer = [];
  if (Data.value.Fifties) {
    for (let i = 0; i < Data.value.Fifties; i++) {
      if (Cnt > 10) {
        DownContainer.value.push(TempContainer);
        TempContainer = [];
        TempContainer.push(getSlotComponentAssets("MoneyGenerator", "50.png"));
        Cnt = 0;
      } else {
        TempContainer.push(getSlotComponentAssets("MoneyGenerator", "50.png"));
        Cnt++;
      }
    }
  }
  if (Data.value.Tens) {
    for (let i = 0; i < Data.value.Tens; i++) {
      if (Cnt > 10) {
        DownContainer.value.push(TempContainer);
        TempContainer = [];
        TempContainer.push(getSlotComponentAssets("MoneyGenerator", "10.png"));
        Cnt = 0;
      } else {
        TempContainer.push(getSlotComponentAssets("MoneyGenerator", "10.png"));
        Cnt++;
      }
    }
  }
  if (Data.value.Fives) {
    for (let i = 0; i < Data.value.Fives; i++) {
      if (Cnt > 10) {
        DownContainer.value.push(TempContainer);
        TempContainer = [];
        TempContainer.push(getSlotComponentAssets("MoneyGenerator", "5.png"));
        Cnt = 0;
      } else {
        TempContainer.push(getSlotComponentAssets("MoneyGenerator", "5.png"));
        Cnt++;
      }
    }
  }
  if (Data.value.Ones) {
    for (let i = 0; i < Data.value.Ones; i++) {
      if (Cnt > 10) {
        DownContainer.value.push(TempContainer);
        TempContainer = [];
        TempContainer.push(getSlotComponentAssets("MoneyGenerator", "1.png"));
        Cnt = 0;
      } else {
        TempContainer.push(getSlotComponentAssets("MoneyGenerator", "1.png"));
        Cnt++;
      }
    }
  }
  if (TempContainer.length > 0) {
    DownContainer.value.push(TempContainer);
    for (let i = 0; i < 10 - TempContainer.length; i++) {
      TempContainer.push("");
    }
  }
};
function updateContainerSize() {
  if (Container.value) {
    const { width, height } = Container.value.getBoundingClientRect();
    console.log(width, height);
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
<script>
export default {
  name: "MyComponent",
};
</script>
<style scoped lang="scss">
/* Your component styles here */
.Container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* grid-template-columns: 1fr;
    grid-template-rows: repeat(4,1fr); */
  gap: 10px;
}
.papaer-money {
  img {
    height: 70px;
  }
}
.MoneyContainer {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(auto-fill, 1fr);
  gap: 10px;
}
.CoinContainer {
  display: flex;
  flex-direction: row;
  width: 100%;
  max-height: 40px;
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
