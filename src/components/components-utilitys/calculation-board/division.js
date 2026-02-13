class DivisionConfig {
  constructor() {
    this.maxLength = 0;
    this.unitMap = {
      Length: ["公分", "", "", "公尺"],
      Time: ["秒", "", "分", "", "時"],
      Volume: ["毫升", "", "", "公升"],
      Weight: ["公克", "", "", "公斤"],
      Number: ["個位", "十位", "百位", "千位", "萬位"],
    };
  }

  // 取得題目要顯示的格子樣式
  getGrid(data) {
    this.maxLength = this.getMaxDigit(data);
    return {
      unit: this.getUnitLabels(data.unitType, data.customUnit, data),
      carry: [], // 除法不需要進位
      operation: this.getOperation(this.maxLength, data),
    };
  }

  // 計算最大位數
  getMaxDigit(data) {
    if (data.mode === "freeInput") {
      return data.digit * 2;
    }
    const { operand1, operand2 } = data.operands || {};
    return (
      (operand2?.toString().length || 0) + (operand1?.toString().length || 0)
    );
  }

  // 生成運算符號和數字格子
  getOperation(maxLength, data) {
    const { numbers } = this.calculateDivisionSteps(data);
    return [
      this.createQuotientRow(maxLength, data),
      this.createQuestionRow(maxLength, data),
      ...this.createCalculationRows(maxLength, numbers, data),
    ];
  }

  // 創建商數行
  createQuotientRow(maxLength, data) {
    const { result } = this.calculateDivisionSteps(data);
    const resultStr = result.toString();
    const boundaryLength =
      data.mode === "freeInput" ? data.digit : this.getOperand2Length(data);

    return Array.from({ length: maxLength }, (_, i) => {
      const isAdjustable = i >= boundaryLength;
      const isDisplay = data.mode === "display";

      // 修正答案計算邏輯 - 答案從個位數開始從右邊排列
      let answer = "";
      if (isAdjustable) {
        // 計算從右邊開始的答案位置
        if (i >= maxLength - resultStr.length) {
          answer = resultStr[i - (maxLength - resultStr.length)];
        }
      }

      let text = "";

      if (data.mode === "display") {
        text = answer;
      } else if (data.mode === "checkAnswer") {
        text = ""; // checkAnswer 模式 text 為空
      }

      return {
        text,
        answer,
        visible: isAdjustable,
        editable: isAdjustable && !isDisplay ? "number" : null,
        class: isAdjustable ? "--border-bottom" : "",
      };
    });
  }

  // 創建問題行
  createQuestionRow(maxLength, data) {
    if (data.mode === "freeInput") {
      return Array.from({ length: maxLength }, (_, i) => ({
        text: "",
        visible: true,
        editable: "number",
        class: i === data.digit - 1 ? "--border-right" : "",
      }));
    }

    const { operand1, operand2 } = data.operands || {};
    const operand1Str = operand1?.toString() || "";
    const operand2Str = operand2?.toString() || "";
    const operand2Length = operand2Str.length;

    return Array.from({ length: maxLength }, (_, i) => {
      const isDivisor = i < operand2Length;
      const value = isDivisor
        ? operand2Str[i]
        : operand1Str[i - operand2Length] || "";

      return {
        text: value,
        visible: true,
        editable: false,
        class: i === operand2Length - 1 ? "--border-right" : "",
      };
    });
  }

  // 創建計算過程行
  createCalculationRows(maxLength, numbers, data) {
    if (data.mode === "freeInput") {
      return this.createFreeInputRows(maxLength, data);
    }
    return this.createStandardCalculationRows(maxLength, numbers, data);
  }

  // 創建自由輸入模式的計算行
  createFreeInputRows(maxLength, data) {
    return Array.from({ length: data.digit * 2 }, (_, i) =>
      Array.from({ length: maxLength }, (_, j) => ({
        text: "",
        visible: j >= data.digit,
        editable: "number",
        class: j >= data.digit && i % 2 === 0 ? "--border-bottom" : "",
      }))
    );
  }

  // 創建標準計算行
  createStandardCalculationRows(maxLength, numbers, data) {
    const rows = [];
    const operand2Length = this.getOperand2Length(data);
    let pos = 0;

    for (let i = 0; i < Math.floor(numbers.length / 2); i++) {
      const [number0, number1, number2] = [
        numbers[i * 2],
        numbers[i * 2 + 1],
        numbers[i * 2 + 2],
      ].map((n) => n?.toString() || "");

      // 第一行（被除數）
      rows.push(
        this.createCalculationRow(
          maxLength,
          operand2Length,
          pos,
          number1,
          "--border-bottom",
          data
        )
      );

      // 更新位置
      const diff = parseInt(number0) - parseInt(number1);
      pos += number0.length - (diff !== 0 ? diff.toString().length : 0);

      // 第二行（餘數）
      // 判斷是不是最後一個 number2（餘數）
      const isLastRow = i === Math.floor(numbers.length / 2) - 1;
      let remainderPos = pos;
      if (isLastRow && number2 === "0") {
        remainderPos = maxLength - data.operands.operand2.toString().length - 1;
      }
      rows.push(
        this.createCalculationRow(
          maxLength,
          operand2Length,
          remainderPos,
          number2,
          "",
          data
        )
      );
    }
    return rows;
  }

  // 創建單個計算行
  createCalculationRow(
    maxLength,
    operand2Length,
    pos,
    numberStr,
    className = "",
    data
  ) {
    console.log(
      "numberStr:",
      numberStr,
      "pos:",
      pos,
      "operand2Length:",
      operand2Length,
      "maxLength:",
      maxLength
    );
    return Array.from({ length: maxLength }, (_, j) => {
      const isInRange =
        j >= operand2Length + pos &&
        j < operand2Length + pos + numberStr.length;
      const answer = isInRange ? numberStr[j - operand2Length - pos] : "";

      // 根據模式決定 text 和 editable
      let text = "";
      let editable = null;

      if (data.mode === "display") {
        text = answer; // display 模式直接顯示答案
      } else if (data.mode === "checkAnswer") {
        text = ""; // checkAnswer 模式 text 為空
        editable = isInRange ? "number" : null; // 可以編輯
      }

      return {
        text,
        answer,
        visible: isInRange,
        editable,
        class: className && j >= operand2Length ? `${className}` : "",
      };
    });
  }

  // 計算除法步驟
  calculateDivisionSteps(data) {
    const { operand1, operand2 } = data.operands || {};
    if (!operand1 || !operand2) return { numbers: [], result: "" };

    const divisor = parseInt(operand2);
    const digits = String(operand1).split("").map(Number);
    const numbers = [];
    let current = "";
    let result = "";

    for (let i = 0; i < digits.length; i++) {
      current += digits[i];
      const currentNum = parseInt(current);

      if (currentNum < divisor && result === "") continue;

      const q = Math.floor(currentNum / divisor);
      const sub = q * divisor;
      const rem = currentNum - sub;

      result += q;
      if (q === 0 && i === digits.length - 1) continue;

      numbers.push(currentNum, sub);
      current = String(rem);
    }

    numbers.push(parseInt(current));
    // console.log("numbers:", numbers);
    return { numbers, result };
  }

  // 單位顯示
  getUnitLabels(unitType, customUnit, data) {
    const operand2Length = this.getOperand2Length(data);
    const operand1Length = this.getOperand1Length(data);

    if (data.mode === "freeInput") {
      const emptyStrings = Array(data.digit).fill(" ");
      const units =
        this.unitMap[unitType]?.slice(0, data.digit).reverse() || [];
      return [...emptyStrings, ...units];
    }

    const emptyStrings = Array(operand2Length).fill(" ");

    if (unitType === "Custom") {
      const customUnits = customUnit?.slice(0, operand1Length) || [];
      return [...emptyStrings, ...customUnits];
    }

    const units =
      this.unitMap[unitType]?.slice(0, operand1Length).reverse() || [];
    return [...emptyStrings, ...units];
  }

  // 輔助方法：取得除數長度
  getOperand2Length(data) {
    const { operand2 } = data.operands || {};
    return operand2?.toString().length || 1;
  }

  // 輔助方法：取得被除數長度
  getOperand1Length(data) {
    const { operand1 } = data.operands || {};
    return operand1?.toString().length || 1;
  }

  // 獲取答案
  getAnswer(data) {
    if (data.mode === "freeInput") {
      return { quotient: 0, remainder: 0 };
    }

    const { operand1, operand2 } = data.operands || {};
    if (operand1 === undefined || operand2 === undefined) {
      return { quotient: 0, remainder: 0 };
    }

    return {
      quotient: Math.floor(operand1 / operand2),
      remainder: operand1 % operand2,
    };
  }
}

export default new DivisionConfig();

/*
使用範例：

// 在 Vue 組件中使用
import divisionConfig from '@/components/board/configs/division.js';

// 數據格式
const divisionData = {
  mode: "checkAnswer", // "display", "checkAnswer", "freeInput"
  unitType: "Number", // "Length", "Time", "Volume", "Weight", "Number", "Custom"
  operands: {
    operand1: 1234, // 被除數
    operand2: 12    // 除數
  }
};

// 在 GenericBoard 組件中使用
<GenericBoard 
  :data="divisionData" 
  :config="divisionConfig" 
  :game-id="'division-1'"
  @replyAnswer="handleAnswer"
/>
*/
