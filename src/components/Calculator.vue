<template>
  <div class="outter">
    <div class="calculator">
      <div class="unit btn-group" style="flex-direction: row-reverse">
        <div v-for="(item, index) in Title" :key="index" class="units">
          <button v-if="item != null" type="button">
            {{ item }}
          </button>
          <div v-if="item == null" class="space" />
        </div>
      </div>
      <div v-for="(carries, Row) in Carry" :key="Row" class="carry btn-group">
        <div v-for="(items, cnt) in carries" :key="cnt" class="carrys">
          <button ref="Carry" :class="{ 'btn--line': CarryLine[Row][cnt] }">
            {{ items }}
            <q-menu anchor="top left" self="bottom left" class="q-menu">
              <div class="btns">
                <button v-close-popup @click="CarryInput(Row, cnt, 0)">
                  0
                </button>
                <button
                  v-for="index in 5"
                  :key="index"
                  v-close-popup
                  @click="CarryInput(Row, cnt, index)"
                >
                  {{ index }}
                </button>
                <button
                  v-for="index in 5"
                  :key="index"
                  v-close-popup
                  @click="CarryInput(Row, cnt, index + 5)"
                >
                  {{ index + 5 }}
                </button>
                <button v-close-popup @click="CarryInput(Row, cnt, '/')">
                  /
                </button>
                <button v-close-popup @click="CarryInput(Row, cnt, 'delete')">
                  <q-icon name="bi-trash" />
                </button>
              </div>
            </q-menu>
          </button>
          <button v-if="Num_list[0][cnt] == '.'">.</button>
        </div>
      </div>
      <hr />
      <div class="number-area">
        <div
          v-for="(items, Row) in Num_list"
          :key="Row"
          class="NumberRow btn-group"
        >
          <button v-if="Row != 0">
            {{ Sy_list[Row] }}
            <q-menu
              v-if="SymbolEditable[Row]"
              anchor="top left"
              self="bottom left"
              class="q-menu"
            >
              <div class="btns">
                <button @click="SymbolInput(Row, '+')">+</button>
                <button @click="SymbolInput(Row, '-')">-</button>
              </div>
            </q-menu>
          </button>
          <div class="space" />
          <div class="NumbersContainer btn-group">
            <div
              v-for="(item, Col) in items"
              :key="Col"
              style="display: flex; justify-content: center"
            >
              <button v-if="Num_list[0][Col] == '.'">.</button>
              <button v-else :class="{ 'btn--line': ButtonLine[Row][Col] }">
                {{ item }}
                <q-menu anchor="top left" self="bottom left" class="q-menu">
                  <div class="btns">
                    <button
                      v-if="NumberEditable[Row][Col]"
                      @click="NumInput(Row, Col, 0)"
                    >
                      0
                    </button>
                    <template v-for="index in 5">
                      <button
                        v-if="NumberEditable[Row][Col]"
                        :key="index"
                        @click="NumInput(Row, Col, index)"
                      >
                        {{ index }}
                      </button>
                    </template>
                    <template v-for="index in 4">
                      <button
                        v-if="NumberEditable[Row][Col]"
                        :key="index"
                        @click="NumInput(Row, Col, index + 5)"
                      >
                        {{ index + 5 }}
                      </button>
                    </template>
                    <button @click="NumInput(Row, Col, '/')">/</button>
                    <button
                      v-if="NumberEditable[Row][Col]"
                      @click="NumInput(Row, Col, 'delete')"
                    >
                      <q-icon name="bi-trash" />
                    </button>
                  </div>
                </q-menu>
              </button>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div class="answer btn-group">
        <div v-for="(item, col) in Ans" class="AnswerContainer">
          <button
            :class="{
              'btn-wrong': WrongAnswerMarkup[col],
              'btn-normal': WrongAnswerMarkup[col] == false,
            }"
            class="answers"
          >
            {{ item }}
            <q-menu anchor="top left" self="bottom left" class="q-menu">
              <div class="btns">
                <button v-close-popup @click="AnsInput(col, 0)">0</button>
                <button
                  v-for="index in 5"
                  v-close-popup
                  @click="AnsInput(col, index)"
                >
                  {{ index }}
                </button>
                <button
                  v-for="index in 5"
                  v-close-popup
                  @click="AnsInput(col, index + 5)"
                >
                  {{ index + 5 }}
                </button>
                <button v-close-popup @click="AnsInput(col, 'delete')">
                  <q-icon name="bi-trash" />
                </button>
              </div>
            </q-menu>
          </button>
          <button v-if="Num_list[0][col - 1] == '.'">.</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";
export default {
  name: "Calculator",
  display: "Calculator",
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
      Num_list: [],
      Sy_list: [],
      Ans: [],
      Carry: [],
      Title: [],
      ButtonLine: [],
      CarryLine: [],
      AnswerLine: [],
      NumberEditable: [],
      SymbolEditable: [],
      WrongAnswerMarkup: [],
      NumberRow: 2,
      NumberAmount: 8,
      DotPosition: 0,
      //   Data: {
      //     Unit: "Number",
      //     CarryAmount: 2,
      //     NumberAmount: 5,
      //     CustomeUnit: null,
      //     decimalPoint: 1,
      //     Preset: {
      //       Number: ["149.2", "254.1"],
      //       Symbol: "+",
      //     },
      //     Answer: {
      //       Carry: [],
      //       Answer: "403",
      //       Number: ["149", "254"],
      //       Symbol: "+",
      //     },
      //   },
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
            Title: ["毫米", "公分", null, "公尺", null, "公里"],
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
  created() {
    // this.Data = this.GameData;
    this.NumberAmount = this.Data.NumberAmount;
    this.DotPosition = this.Data.decimalPoint;
    if (this.Data.CustomeUnit != undefined) {
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
      this.Ans.push("");
      this.AnswerLine.push(false);
      this.WrongAnswerMarkup.push(false);
    }

    for (var i = 0; i < this.Data.CarryAmount; i++) {
      let temp = [];
      let templine = [];
      for (var x = 0; x < this.NumberAmount; x++) {
        temp.push("");
        templine.push(false);
      }
      this.Carry.push(temp);
      this.CarryLine.push(templine);
    }
    for (var x = 0; x < this.NumberRow; x++) {
      let temp = [];
      this.Sy_list.push("");
      this.SymbolEditable.push(true);
      let tempNumber = [];
      let tempeditable = [];
      for (var i = 0; i < this.NumberAmount; i++) {
        temp.push("");
        tempNumber.push(false);
        tempeditable.push(true);
      }
      this.Num_list.push(temp);
      this.ButtonLine.push(tempNumber);
      this.NumberEditable.push(tempeditable);
    }
    this.UseUnit(this.Data.Unit);
    this.presetCalculator();
    this.shiftNumber();
    emitter.on("checkAnswer", this.parentRequestCheckAnswer);
  },
  methods: {
    shiftNumber() {
      for (var i in this.Num_list) {
        for (var j in this.Num_list[i]) {
          if (this.Num_list[i][j] == ".") {
            if (this.Num_list[i].length - 1 - j < this.DotPosition) {
              for (
                var x = 0;
                x < this.DotPosition - (this.Num_list[i].length - 1 - j);
                x++
              ) {
                this.Num_list[i].push("");
              }
            }
          }
        }
      }
    },
    CarryInput(Row, index, num) {
      if (num == "delete") {
        this.Carry[Row][index] = "";
      } else if (num == "/") {
        this.CarryLine[Row][index] = !this.CarryLine[Row][index];
      } else {
        this.Carry[Row][index] = num;
      }
      this.checkAnswer();
    },
    NumInput(Row, Col, num) {
      if (num == "delete") {
        this.Num_list[Row][Col] = "";
      } else if (num == "/") {
        this.ButtonLine[Row][Col] = !this.ButtonLine[Row][Col];
      } else {
        this.Num_list[Row][Col] = num;
      }
      this.checkAnswer();
    },
    AnsInput(index, num) {
      this.WrongAnswerMarkup[index] = false;
      if (num == "delete") {
        this.Ans[index] = "";
      } else if (num == "/") {
        this.AnswerLine[index] = !this.AnswerLine[index];
      } else {
        this.Ans[index] = num;
      }
      this.checkAnswer();
    },
    presetCalculator() {
      for (var i in this.Data.Preset.Number) {
        let temp = this.Num_list[i].length - 1;
        if (
          this.Data.Preset.Symbol != undefined &&
          this.Data.Preset.Symbol != null &&
          this.Data.Preset.Symbol != ""
        ) {
          this.Sy_list[i] = this.Data.Preset.Symbol;
          this.SymbolEditable[i] = false;
        }
        for (var j = this.Data.Preset.Number[i].length - 1; j >= 0; j--) {
          this.Num_list[i][temp] = this.Data.Preset.Number[i][j];
          this.NumberEditable[i][temp] = false;
          temp--;
        }
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
    checkAnswer() {
      let AnswerCheck = true;
      for (var i in this.Data.Answer.Number) {
        let temp = this.Num_list[i].length - 1;
        for (var j = this.Data.Answer.Number[i].length - 1; j >= 0; j--) {
          if (this.Num_list[i][temp] != this.Data.Answer.Number[i][j]) {
            AnswerCheck = false;
          }
          temp--;
        }
      }
      let temp = this.Ans.length - 1;
      for (var i = this.Data.Answer.Answer.length - 1; i >= 0; i--) {
        if (this.Ans[temp] != this.Data.Answer.Answer[i]) {
          AnswerCheck = false;
          // this.WrongAnswerMarkup[temp] = true;
        }
        temp--;
      }
      //Carry
      if (
        this.Data.Answer.Carry != undefined &&
        this.Data.Answer.Carry != null &&
        this.Data.Answer.Carry != []
      ) {
        for (var i in this.Data.Answer.Carry) {
          let temp = this.Carry[i].length - 1;
          for (var j = this.Data.Answer.Carry[i].length - 1; j >= 0; j--) {
            if (this.Carry[i][temp] != this.Data.Answer.Carry[i][j]) {
              AnswerCheck = false;
              console.log("Carry Wrong");
            }
            temp--;
          }
        }
      }
      if (AnswerCheck) {
        this.$emit("replyAnswer", true);
      } else {
        var wrongAnswer = 0;
        var digits = Math.ceil(
          Math.log(this.Data.Answer.Answer) / Math.log(10)
        );
        for (var i = 0; i < this.Ans.length - 1; ++i) {
          if (this.Ans[this.Ans.length - i - 1] != null) {
            wrongAnswer += this.Ans[this.Ans.length - i - 1] * Math.pow(10, i);
          } else {
            if (i < digits) wrongAnswer = null;
            break;
          }
        }
      }
      if (wrongAnswer) {
        this.$emit("replyAnswer", false);
      }
    },
    parentRequestCheckAnswer() {
      let AnswerCheck = true;
      for (var i in this.Data.Answer.Number) {
        let temp = this.Num_list[i].length - 1;
        for (var j = this.Data.Answer.Number[i].length - 1; j >= 0; j--) {
          if (this.Num_list[i][temp] != this.Data.Answer.Number[i][j]) {
            AnswerCheck = false;
          }
          temp--;
        }
      }
      let temp = this.Ans.length - 1;
      for (var i = this.Data.Answer.Answer.length - 1; i >= 0; i--) {
        if (this.Ans[temp] != this.Data.Answer.Answer[i]) {
          AnswerCheck = false;
          this.WrongAnswerMarkup[temp] = true;
        }
        temp--;
      }
    },
    clear: function (evt) {
      for (var x in this.Carry) {
        for (var y in this.Carry[x]) {
          this.Carry[x][y] = "";
        }
      }
      for (var x in this.Ans) {
        this.Ans[x] = "";
        this.WrongAnswerMarkup[x] = false;
      }
      for (var x in this.Num_list) {
        for (var y in this.Num_list[x]) {
          this.Num_list[x][y] = "";
        }
      }
      for (var x in this.Sy_list) {
        this.Sy_list[x] = "";
      }
      this.presetCalculator();
    },
  },
};
</script>
<style lang="scss" scoped>
.outter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
}
.calculator {
  display: flex;
  flex-direction: column;
  .carrys {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 5px;
  }
  .btn-group {
    display: flex;
    flex-direction: row;
    justify-content: end;
    align-items: center;
    gap: 12px;
    margin: 5px 0;
    .btn--line {
      background: linear-gradient(
        120deg,
        transparent 49.5%,
        black 45.5%,
        black 51.5%,
        transparent 50%
      );
      background-color: $sub-color;
    }
  }
  .number-area button {
    background-color: $primary-color;
  }
  .carrys button {
    border: dashed 3px;
    background-color: white;
    color: $hightlight-color;
  }
  .answer {
    .btn-wrong {
      background-color: $error-color;
    }
    .btn-normal {
      background-color: $sub-color;
    }
    .AnswerContainer {
      display: flex;
      flex-direction: row;
      justify-content: center;
    }
  }
  .unit button {
    background-color: $accent-color;
    height: auto;
    border: none;
  }
  .btn-primary {
    width: 40px;
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
  margin-top: 20px;
  button {
    height: 3rem;
    width: 13rem;
    background-color: $accent-color;
  }
}
hr {
  height: 2px;
  border-width: 0;
  color: $dark-color;
  background-color: $dark-color;
}
.btns {
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

button {
  border: none;
  border-radius: 10px;
  color: $dark-color;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 60px;
  font-size: x-large;
  font-weight: bold;
}
</style>
