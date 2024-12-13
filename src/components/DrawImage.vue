<template>
  <div class="Container">
    <p v-if="Data.Text != undefined">
      {{ Data.Text }}
    </p>
    <div class="Division">
      <p class="Child">
        {{ Data.Child }}
      </p>
      <hr class="Fraction-line" />
      <p class="Mother">
        {{ Data.Mother }}
      </p>
    </div>
    <p class="Unit">
      {{ Data.Unit }}
    </p>
    <div class="table-container">
      <div
        v-for="(item, index) in Items"
        :key="index"
        class="table-cell"
        @click="toggleImage(index)"
      >
        <img :src="item" :alt="Data.Alt" />
      </div>
    </div>
  </div>
</template>

<script>
import { getSlotComponentAssets } from "@/utilitys/get_assets.js";
import { getGameAssets } from "@/utilitys/get_assets.js";
export default {
  name: "DrawImage",
  props: {
    Data: {
      type: Object,
      required: true,
    },
    ID: {
      type: String,
      required: true,
    },
  },
  emits: ["replyAnswer"],
  data() {
    return {
      Items: [],
      image1: "",
      image2: "",
      Alt: "",
      clickedStatus: [],
      DataBase: {
        apple: {
          First: "apple1.png",
          Second: "apple2.png",
          Alt: "apple",
        },
      },
    };
  },
  created() {
    if (this.Data.Object != undefined) {
      if (this.Data.Object in this.DataBase) {
        this.image1 = getSlotComponentAssets(
          "DrawOnImage",
          this.DataBase[this.Data.Object].First
        );
        this.image2 = getSlotComponentAssets(
          "DrawOnImage",
          this.DataBase[this.Data.Object].Second
        );
        this.Alt = this.DataBase[this.Data.Object].Alt;
      } else if (this.Data.Src && this.Data.Src.First && this.Data.Src.Second) {
        this.image1 = getGameAssets(this.ID, this.Data.Src.First);
        this.image2 = getGameAssets(this.ID, this.Data.Src.Second);
        this.Alt = this.Data.Alt;
      } else {
        this.image1 = getSlotComponentAssets("DrawOnImage", "apple1.png");
        this.image2 = getSlotComponentAssets("DrawOnImage", "apple2.png");
        this.Alt = "apple";
      }
    }

    // 初始化每個格子中的圖片為圖片1，並將 clickedStatus 初始化為 false
    this.Items = Array(this.Data.Mother).fill(this.image1);
    this.clickedStatus = Array(this.Data.Mother).fill(false);
  },
  methods: {
    toggleImage(index) {
      if (this.Items[index] === this.image1) {
        this.Items.splice(index, 1, this.image2);
        this.clickedStatus.splice(index, 1, true);
      } else {
        this.Items.splice(index, 1, this.image1);
        this.clickedStatus.splice(index, 1, false);
      }
      this, this.ReplyAnswer();
    },
    ReplyAnswer() {
      let temp = 0;
      for (var i in this.clickedStatus) {
        if (this.clickedStatus[i] == true) {
          temp += 1;
        }
      }
      if (temp == this.Data.Child) {
        this.$emit("replyAnswer", true);
      } else {
        this.$emit("replyAnswer", false);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.Container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  font-size: x-large;
}

.division {
  width: 20%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.division hr {
  width: 20px;
  border: solid;
}

.table-container {
  width: 70%;
  border: solid #ccc;
  border-radius: 12px;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  background-color: white;
}

.table-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}

.table-cell img {
  max-width: 100%;
  max-height: 100%;
}

.Division {
  display: inline-block;
  text-align: center;
  font-size: 2rem;
  line-height: 2; /* 設置行高 */
  vertical-align: middle; /* 垂直對齊 */
  .Child {
    margin: 0;
  }
  .Mother {
    margin: 0;
  }
  .Fraction-line {
    margin: 0;
    border: none;
    border-top: 2px solid black;
    width: 2em;
  }
}
</style>
