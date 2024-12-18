<template>
  <div class="Container">
    <div class="CalculatorBody">
      <div class="unit btn-group" style="flex-direction: row-reverse">
        <div v-for="item in Title" class="units">
          <button v-if="item != null" type="button" class="btn btn-primary">
            {{ item }}
          </button>
          <div v-if="item == null" class="space" />
        </div>
      </div>
      <div class="Carry btn-group">
        <div v-for="(items, cnt) in Carry" class="Carrys">
          <button ref="Carry" :class="{ 'on-line': CarryLine[cnt] }">
            {{ items }}
            <q-menu anchor="top left" self="bottom left" class="q-menu">
              <div class="Btns">
                <button @click="CarryInput(cnt, 0)">0</button>
                <button v-for="index in 5" @click="CarryInput(cnt, index)">
                  {{ index }}
                </button>
                <button v-for="index in 5" @click="CarryInput(cnt, index + 5)">
                  {{ index + 5 }}
                </button>
                <button @click="CarryInput(cnt, '/')">/</button>
                <button @click="CarryInput(cnt, 'delete')">
                  <q-icon name="bi-trash" />
                </button>
              </div>
            </q-menu>
          </button>
        </div>
      </div>
      <hr />
      <div class="NumberArea">
        <div v-for="(items, Row) in Num_list" class="NumberRow btn-group">
          <button v-if="Row != 0">
            {{ Sy_list[Row] }}
            <q-menu anchor="top left" self="bottom left" class="q-menu">
              <div class="Btns">
                <button @click="SymbolInput(Row, '+')">+</button>
                <button @click="SymbolInput(Row, '-')">-</button>
              </div>
            </q-menu>
          </button>
          <div class="space" />
          <div class="NumbersContainer btn-group">
            <button
              v-for="(item, Col) in items"
              :class="{ 'on-line': ButtonLine[Row][Col] }"
            >
              {{ item }}
              <q-menu anchor="top left" self="bottom left" class="q-menu">
                <div class="Btns">
                  <button @click="NumInput(Row, Col, 0)">0</button>
                  <button v-for="index in 5" @click="NumInput(Row, Col, index)">
                    {{ index }}
                  </button>
                  <button
                    v-for="index in 4"
                    @click="NumInput(Row, Col, index + 5)"
                  >
                    {{ index + 5 }}
                  </button>
                  <button @click="NumInput(Row, Col, '/')">/</button>
                  <button @click="NumInput(Row, Col, 'delete')">
                    <q-icon name="bi-trash" />
                  </button>
                </div>
              </q-menu>
            </button>
          </div>
        </div>
      </div>
      <hr />
      <div class="Answer btn-group">
        <div v-for="(item, Col) in Ans" class="AnswerContainer">
          <button :class="{ 'on-line': AnswerLine[Col] }">
            {{ item }}
            <q-menu anchor="top left" self="bottom left" class="q-menu">
              <div class="Btns">
                <button @click="AnsInput(Col, 0)">0</button>
                <button v-for="index in 5" @click="AnsInput(Col, index)">
                  {{ index }}
                </button>
                <button v-for="index in 5" @click="AnsInput(Col, index + 5)">
                  {{ index + 5 }}
                </button>
                <button @click="AnsInput(Col, 'delete')">
                  <q-icon name="bi-trash" />
                </button>
              </div>
            </q-menu>
          </button>
        </div>
      </div>
      <div class="buttons">
        <button @click="AddRow">新增一行</button>
        <button @click="removerow">移除最後一行</button>
        <button @click="clear">清除所有數字</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Calculator",
  display: "calculator",
  data() {
    return {
      Num_list: [],
      Sy_list: [],
      Ans: [],
      Carry: [],
      Title: [],
      ButtonLine: [],
      CarryLine: [],
      AnswerLine: [],
      NumberEditable: [],
      NumberRow: 2,
      NumberAmount: 3,
      Data: {
        Preset: {
          CarryAmount: 2,
          Carry: [],
          Number: [],
          Symbol: [],
          Answer: [],
        },
      },
      CustomeUnit: undefined,
      UnitPreset: {
        UseUnit: "Volume",
        Units: {
          Number: {
            Title: ["個位", "十位", "百位", "千位", "萬位"],
            Total: 5,
          },
          Time: {
            Title: ["秒", null, "分", null, "時", null, "日"],
            Total: 4,
          },
          Weight: {
            Title: ["公克", null, null, "公斤", null, null, "公噸"],
            Total: 4,
          },
          Length: {
            Title: ["毫米", null, "公分", null, "公尺", null, "公里"],
            Total: 4,
          },
          Volume: {
            Title: ["毫升", null, null, "公升", null, null, "公秉"],
            Total: 3,
          },
        },
      },
    };
  },
  mounted() {
    if (this.CustomeUnit != undefined) {
      for (var i = 0; i < this.CustomeUnit.length; i++) {
        this.Title.push(this.CustomeUnit[i]);
      }
    } else {
      for (var i = 0; i < this.NumberAmount; i++) {
        this.Title.push(
          this.UnitPreset.Units[this.UnitPreset.UseUnit].Title[i]
        );
      }
    }

    for (var i = 0; i <= this.NumberAmount; i++) {
      this.Carry.push("");
      this.CarryLine.push(false);
      this.Ans.push("");
      this.AnswerLine.push(false);
    }
    for (var x = 0; x < this.NumberRow; x++) {
      console.log("test");
      let temp = [];
      this.Sy_list.push("");
      let tempNumber = [];
      for (var i = 0; i < this.NumberAmount; i++) {
        temp.push("");
        tempNumber.push(false);
      }
      this.Num_list.push(temp);
      this.ButtonLine.push(tempNumber);
    }
  },
  methods: {
    CarryInput(index, num) {
      if (num == "delete") {
        this.Carry[index] = "";
      } else if (num == "/") {
        this.CarryLine[index] = !this.CarryLine[index];
      } else {
        this.Carry[index] = num;
      }
    },
    NumInput(Row, Col, num) {
      if (num == "delete") {
        this.Num_list[Row][Col] = "";
      } else if (num == "/") {
        this.ButtonLine[Row][Col] = !this.ButtonLine[Row][Col];
      } else {
        this.Num_list[Row][Col] = num;
      }
    },
    AnsInput(index, num) {
      if (num == "delete") {
        this.Ans[index] = "";
      } else if (num == "/") {
        this.AnswerLine[index] = !this.AnswerLine[index];
      } else {
        this.Ans[index] = num;
      }
    },
    SymbolInput(index, num) {
      this.Sy_list[index] = num;
    },
    SetUnit: function (num) {
      if (
        !(this.NumberAmount == 8 && num == 1) &&
        !(this.NumberAmount == 2 && num == -1)
      ) {
        this.NumberAmount = this.NumberAmount + num;
        console.log(this.NumberAmount);
        this.Title = [];
        this.Num_list = [];
        this.Sy_list = [];
        this.Carry = [];
        this.Ans = [];
        this.ButtonLine = [];
        this.CarryLine = [];

        for (var i = 0; i < this.NumberAmount; i++) {
          this.Title.push(
            this.UnitPreset.Units[this.UnitPreset.UseUnit].Title[i]
          );
        }
        for (var i = 0; i <= this.NumberAmount; i++) {
          this.Carry.push([]);
          this.Ans.push([]);
        }
        for (var x = 0; x < this.NumberRow; x++) {
          let temp = [];
          this.Sy_list.push([]);
          for (var i = 0; i < this.NumberAmount; i++) {
            temp.push([]);
          }
          this.Num_list.push(temp);
        }
      }
    },
    UseUnit: function (unit) {
      this.UnitPreset.UseUnit = unit;
      this.Title = [];
      for (var i = 0; i < this.NumberAmount; i++) {
        this.Title.push(
          this.UnitPreset.Units[this.UnitPreset.UseUnit].Title[i]
        );
      }
    },
    removerow: function (evt) {
      if (this.Num_list.length > 2) {
        this.Num_list.pop();
        this.Sy_list.pop();
        this.ButtonLine.pop();
        this.NumberRow--;
      }
    },
    AddRow: function () {
      this.NumberRow++;
      let temp = [];
      let tempNumber = [];
      this.Sy_list.push("");
      for (var i = 0; i < this.NumberAmount; i++) {
        temp.push("");
        tempNumber.push(false);
      }
      this.Num_list.push(temp);
      this.ButtonLine.push(tempNumber);
    },
    clear: function (evt) {
      for (var x in this.Carry) {
        this.Carry[x] = "";
      }
      for (var x in this.Ans) {
        this.Ans[x] = "";
      }
      for (var x in this.Num_list) {
        for (var y in this.Num_list[x]) {
          this.Num_list[x][y] = "";
        }
      }
      for (var x in this.Sy_list) {
        this.Sy_list[x] = "";
      }
    },
  },
};
</script>
<style lang="scss" scope>
.Container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.CalculatorBody {
  display: flex;
  flex-direction: column;
  .btn-group {
    display: flex;
    flex-direction: row;
    justify-content: end;
    align-items: center;
    gap: 12px;
    margin: 5px 0;
    button {
      width: 40px;
      height: 50px;
    }
    .on-line {
      background: linear-gradient(
        60deg,
        transparent 49.5%,
        black 45.5%,
        black 51.5%,
        transparent 50%
      );
    }
  }
  .btn-primary {
    width: 40px;
  }
  :deep(.q-btn) {
    width: 40px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(
      60deg,
      transparent 49.5%,
      black 45.5%,
      black 51.5%,
      transparent 50%
    );
  }
}
.space {
  width: 40px;
}

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 1rem;
  button {
    height: 4rem;
  }
}

hr {
  height: 2px;
  border-width: 0;
  color: black;
  background-color: black;
}

.Btns {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  button {
    border: none;
    border-radius: 15px;
    height: 40px;
    width: 40px;
  }
}

.Selection {
  position: sticky;
  top: 0;
  max-height: 100vh;
  display: flex;
  flex-direction: row;
  justify-content: center;
  .NumberContainer {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
  .SymbolContainer {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
  button {
    height: 60px;
    width: 50px;
  }
}
</style>
