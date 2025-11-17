class DecimalConfig {
  constructor() {
    this.maxLength = {
      beforeDecimal: 0,
      afterDecimal: 0,
    };
  }

  // 取得題目要顯示的格子樣式
  getGrid(data) {
    this.maxLength = this.getMaxDigit(data);
    const unit = this.getUnitLabels(data.unitType, data.customUnit);
    const carry = this.getCarry(data);
    const operation = this.getOperation(this.maxLength, data);

    return { unit, carry, operation };
  }

  // 計算最大位數（小數點前後分別計算）
  getMaxDigit(data) {
    if (data.mode === "freeInput") {
      return {
        beforeDecimal: data.digit?.beforeDecimal || 3,
        afterDecimal: data.digit?.afterDecimal || 2,
      };
    }

    const { operand1, operand2 } = data.operands;
    const answer = data.answer;

    const splitNumber = (num) => {
      const str = num.toString();
      const parts = str.split(".");
      return {
        beforeDecimal: parts[0].length,
        afterDecimal: parts.length > 1 ? parts[1].length : 0,
      };
    };

    const firstLength = splitNumber(operand1);
    const secondLength = splitNumber(operand2);
    const answerLength = splitNumber(answer);

    return {
      beforeDecimal: Math.max(
        firstLength.beforeDecimal,
        secondLength.beforeDecimal,
        answerLength.beforeDecimal
      ),
      afterDecimal: Math.max(
        firstLength.afterDecimal,
        secondLength.afterDecimal,
        answerLength.afterDecimal
      ),
    };
  }

  // 生成運算符號和數字格子
  getOperation(maxLength, data) {
    const operation = [];
    const rowSet = this.getRowSet(maxLength, data);

    for (let i = 0; i < 3; i++) {
      const row = this.createRow(i, maxLength, data, rowSet);
      operation.push(row);
    }

    return operation;
  }

  // 獲取每行的數據
  getRowSet(maxLength, data) {
    if (data.mode === "freeInput") return [];

    const { operand1, operand2 } = data.operands;
    const answer = data.answer;

    const formatNumber = (num) => {
      const str = num.toString();
      const parts = str.split(".");
      const beforeDecimal = parts[0].padStart(maxLength.beforeDecimal, "0");
      const afterDecimal =
        parts.length > 1
          ? parts[1].padEnd(maxLength.afterDecimal, "0")
          : "0".repeat(maxLength.afterDecimal);
      return { beforeDecimal, afterDecimal };
    };

    const first = formatNumber(operand1);
    const second = formatNumber(operand2);
    const result = formatNumber(answer);

    return [
      { beforeDecimal: first.beforeDecimal, afterDecimal: first.afterDecimal },
      {
        beforeDecimal: second.beforeDecimal,
        afterDecimal: second.afterDecimal,
      },
      {
        beforeDecimal: result.beforeDecimal,
        afterDecimal: result.afterDecimal,
      },
    ];
  }

  // 創建單行格子
  createRow(rowIndex, maxLength, data, rowSet) {
    const row = [];
    const isSecondRow = rowIndex === 1;

    // 添加運算符號
    row.push(this.createOperatorCell(data, isSecondRow));

    // 添加小數點前的數字格子
    for (let j = 0; j < maxLength.beforeDecimal; j++) {
      row.push(
        this.createNumberCell(rowIndex, j, maxLength, data, rowSet, true)
      );
    }

    // 添加小數點
    if (maxLength.afterDecimal > 0) {
      row.push(this.createDecimalPointCell(isSecondRow));
    }

    // 添加小數點後的數字格子
    for (let j = 0; j < maxLength.afterDecimal; j++) {
      row.push(
        this.createNumberCell(rowIndex, j, maxLength, data, rowSet, false)
      );
    }

    return row;
  }

  // 創建運算符號格子
  createOperatorCell(data, isSecondRow) {
    let operator = "";

    if (data.mode === "freeInput") {
      operator = "";
    } else {
      // 優先使用 operation 欄位判斷運算符號
      if (data.operation) {
        const operation = data.operation.toLowerCase();
        if (operation === "add" || operation === "+") {
          operator = "+";
        } else if (
          operation === "sub" ||
          operation === "-" ||
          operation === "subtract"
        ) {
          operator = "－";
        }
      }
    }

    return {
      text: operator,
      visible: isSecondRow,
      class: `${isSecondRow ? "--border-bottom" : ""}`,
      ...(isSecondRow && data.mode === "freeInput"
        ? { editable: "operator" }
        : {}),
    };
  }

  // 創建小數點格子
  createDecimalPointCell(isSecondRow) {
    return {
      text: ".",
      visible: true,
      editable: false,
      class: `${isSecondRow ? "--border-bottom" : ""}`,
    };
  }

  // 創建數字格子
  createNumberCell(
    rowIndex,
    colIndex,
    maxLength,
    data,
    rowSet,
    isBeforeDecimal
  ) {
    const isSecondRow = rowIndex === 1;
    const isLastRow = rowIndex === 2;

    let text = "";
    let answer = "";

    if (rowSet[rowIndex]) {
      if (isBeforeDecimal) {
        text = rowSet[rowIndex].beforeDecimal[colIndex];
        // 只讓最高位（非個位）多餘格子顯示空白，個位一定顯示數字
        const originalLength = rowSet[rowIndex].beforeDecimal.replace(
          /^0+/,
          ""
        ).length;
        const isLastBeforeDecimal = colIndex === maxLength.beforeDecimal - 1;
        if (
          !isLastBeforeDecimal &&
          colIndex < maxLength.beforeDecimal - originalLength
        ) {
          text = "";
        }
        if (isLastRow && data.mode === "checkAnswer") {
          answer = rowSet[rowIndex].beforeDecimal[colIndex];
        }
      } else {
        text = rowSet[rowIndex].afterDecimal[colIndex];
        if (isLastRow && data.mode === "checkAnswer") {
          answer = rowSet[rowIndex].afterDecimal[colIndex];
        }
      }
    }

    const result = {
      text: !isLastRow || data.mode === "display" ? text : "",
      visible: text !== "" || isLastRow || data.mode === "freeInput",
      class: `${isSecondRow ? "--border-bottom" : ""}`,
    };

    if (isLastRow && data.mode === "checkAnswer") {
      result.answer = answer;
    }

    if (isLastRow || data.mode === "freeInput") {
      result.editable = "number";
    }

    return result;
  }

  // 單位顯示
  getUnitLabels(unitType, customUnit) {
    const units = [];

    // 添加運算符號的空白單位
    units.push(" ");

    if (unitType === "Custom") {
      // 自定義單位
      const beforeDecimalUnits = customUnit?.beforeDecimal || [];
      const afterDecimalUnits = customUnit?.afterDecimal || [];

      // 小數點前的單位
      for (let i = 0; i < this.maxLength.beforeDecimal; i++) {
        units.push(beforeDecimalUnits[i] || "");
      }

      // 小數點的空白
      if (this.maxLength.afterDecimal > 0) {
        units.push(" ");
      }

      // 小數點後的單位
      for (let i = 0; i < this.maxLength.afterDecimal; i++) {
        units.push(afterDecimalUnits[i] || "");
      }
    } else {
      // 預設單位系統
      const allUnits = {
        Length: {
          beforeDecimal: ["公尺", "公寸", "公分", "公釐"],
          afterDecimal: ["公釐", "絲米", "忽米"],
        },
        Time: {
          beforeDecimal: ["時", "分", "秒"],
          afterDecimal: ["毫秒", "微秒"],
        },
        Volume: {
          beforeDecimal: ["公升", "分升", "厘升", "毫升"],
          afterDecimal: ["微升", "納升"],
        },
        Weight: {
          beforeDecimal: ["公斤", "公克", "分克", "厘克"],
          afterDecimal: ["毫克", "微克"],
        },
        Number: {
          beforeDecimal: ["萬位", "千位", "百位", "十位", "個位"],
          afterDecimal: ["十分位", "百分位", "千分位"],
        },
      };

      const selectedUnits = allUnits[unitType] || allUnits.Number;

      // 小數點前的單位
      for (let i = 0; i < this.maxLength.beforeDecimal; i++) {
        const unitIndex =
          selectedUnits.beforeDecimal.length - this.maxLength.beforeDecimal + i;
        units.push(selectedUnits.beforeDecimal[unitIndex] || "");
      }

      // 小數點的空白
      if (this.maxLength.afterDecimal > 0) {
        units.push(" ");
      }

      // 小數點後的單位
      for (let i = 0; i < this.maxLength.afterDecimal; i++) {
        units.push(selectedUnits.afterDecimal[i] || "");
      }
    }

    return units;
  }

  // 處理進位顯示
  getCarry(data) {
    const carry = [
      {
        text: "",
        isValid: true,
        visible: false,
      },
    ];

    const totalLength =
      this.maxLength.beforeDecimal + this.maxLength.afterDecimal + 1;

    for (let i = 0; i < totalLength; i++) {
      const isLast = i === totalLength - 1;
      const isAdd = data.operation === "+";
      const notFreeInput = data.mode !== "freeInput";

      // 檢查是否為小數點位置
      const isDecimalPointPosition = i === this.maxLength.beforeDecimal;

      carry.push({
        text: "",
        isValid: true,
        editable: "number",
        visible: !(isLast && isAdd && notFreeInput) && !isDecimalPointPosition,
      });
    }

    return carry;
  }
}

export default new DecimalConfig();

/*
使用範例：

// 在 Vue 組件中使用
import decimalConfig from '@/components/board/configs/decimal.js';

// 數據格式範例
const data = {
  mode: "checkAnswer", // "display", "checkAnswer", "freeInput"
  type: "add", // "add", "subtract"
  unitType: "Number", // "Length", "Time", "Volume", "Weight", "Number", "Custom"
  customUnit: {
    beforeDecimal: ["千位", "百位", "十位", "個位"],
    afterDecimal: ["十分位", "百分位"]
  },
  operands: {
    operand1: 12.34,
    operand2: 5.67
  },
  answer: 18.01,
  digit: {
    beforeDecimal: 4,
    afterDecimal: 2
  }
};

// 在 GenericBoard 組件中使用
<GenericBoard 
  :data="data" 
  :config="decimalConfig" 
  :game-id="'decimal-calc-1'"
  @replyAnswer="handleAnswer"
/>
*/
