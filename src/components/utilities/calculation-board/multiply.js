class MultiplyConfig {
  constructor() {
    this.maxLength = 0;
  }

  // 取得題目要顯示的格子樣式
  getGrid(data) {
    this.maxLength = this.getMaxDigit(data);
    const unit = this.getUnitLabels(data.unitType, data.customUnit);
    const carry = this.getCarry(data);
    const operation = this.getOperation(this.maxLength, data);

    return { unit, carry, operation };
  }

  // 計算最大位數
  getMaxDigit(data) {
    if (data.mode === "freeInput") {
      return data.digit * 2;
    }

    const answer = this.getAnswer(data);

    return answer.toString().length;
  }

  // 計算中間過程的行數
  getProcessRows(data) {
    if (data.mode === "freeInput") {
      return data.digit;
    }
    return data.operands.operand2.toString().length;
  }

  // 生成運算符號和數字格子
  getOperation(maxLength, data) {
    const operation = [];
    const rowSet = this.getRowSet(maxLength, data);
    const processRows = this.getProcessRows(data);

    // 第一部分：處理乘數和被乘數
    operation.push(this.createMultiplicandRow(maxLength, data, rowSet));
    operation.push(this.createMultiplierRow(maxLength, data, rowSet));

    // 第二部分：處理中間計算過程
    if (processRows > 1 && data.mode !== "freeInput") {
      const { operand1, operand2 } = data.operands || {};
      if (operand1 !== undefined && operand2 !== undefined) {
        const multiplier = operand2.toString().split("").reverse();
        for (let i = 0; i < processRows; i++) {
          const digit = parseInt(multiplier[i]);
          const partialProduct = operand1 * digit;
          const row = this.createProcessRow(i, maxLength, data, partialProduct);
          operation.push(row);
        }
      }
    } else if (data.mode === "freeInput" && processRows > 1) {
      // 在 freeInput 模式下，添加空的處理行
      for (let i = 0; i < processRows; i++) {
        const row = this.createProcessRow(i, maxLength, data);
        operation.push(row);
      }
    }

    // 第三部分：處理答案
    operation.push(this.createAnswerRow(maxLength, data, rowSet));

    return operation;
  }

  // 創建中間過程行
  createProcessRow(rowIndex, maxLength, data, partialProduct) {
    const row = [];
    // 若為 checkAnswer 模式或沒有 partialProduct，不顯示中間數字
    const productStr =
      data.mode === "freeInput" || !partialProduct
        ? "0".repeat(data.digit + 1)
        : partialProduct.toString().split("");

    row.push({
      text: "",
      visible: false,
      ...(rowIndex === this.getProcessRows(data) - 1
        ? { class: "--border-bottom" }
        : {}),
    });
    for (let i = 0; i < maxLength; i++) {
      if (i < maxLength - (productStr.length + rowIndex)) {
        row.push({
          text: "",
          visible: false,
          ...(rowIndex === this.getProcessRows(data) - 1
            ? { class: "--border-bottom" }
            : {}),
        });
      } else if (i < maxLength - rowIndex) {
        row.push({
          text:
            data.mode === "display" && partialProduct
              ? productStr[i - (maxLength - (productStr.length + rowIndex))]
              : "",
          ...(data.mode !== "display" ? { editable: "number" } : {}),
          ...(data.mode === "checkAnswer" && partialProduct
            ? {
                answer:
                  productStr[i - (maxLength - (productStr.length + rowIndex))],
              }
            : {}),
          visible: true,
          ...(rowIndex === this.getProcessRows(data) - 1
            ? { class: "--border-bottom" }
            : {}),
        });
      } else {
        row.push({
          text: "",
          visible: false,
          ...(rowIndex === this.getProcessRows(data) - 1
            ? { class: "--border-bottom" }
            : {}),
        });
      }
    }
    return row;
  }

  // 創建被乘數行
  createMultiplicandRow(maxLength, data, rowSet) {
    const row = [];
    row.push({ text: "", visible: false });
    for (let j = 0; j < maxLength; j++) {
      if (data.mode === "freeInput") {
        row.push({
          text: "",
          visible: j >= maxLength - data.digit,
          editable: "number",
          class: "",
        });
      } else {
        row.push({
          text: rowSet[0][j],
          visible: rowSet[0][j] !== " ",
          class: "",
        });
      }
    }
    return row;
  }

  // 創建乘數行
  createMultiplierRow(maxLength, data, rowSet) {
    const row = [];
    row.push({ text: "×", visible: true, class: "--border-bottom" });
    for (let j = 0; j < maxLength; j++) {
      if (data.mode === "freeInput") {
        row.push({
          text: "",
          visible: j >= maxLength - data.digit,
          editable: "number",
          class: "--border-bottom",
        });
      } else {
        row.push({
          text: rowSet[1][j],
          visible: rowSet[1][j] !== " ",
          class: "--border-bottom",
        });
      }
    }
    return row;
  }

  // 創建答案行
  createAnswerRow(maxLength, data, rowSet) {
    const row = [];
    row.push({ text: "", visible: false });
    for (let j = 0; j < maxLength; j++) {
      row.push({
        text: data.mode === "display" && rowSet ? rowSet[2][j] : "",
        visible: true,
        ...(data.mode === "checkAnswer" && rowSet
          ? { answer: rowSet[2][j] }
          : {}),
        editable: "number",
      });
    }
    return row;
  }

  getAnswer(data) {
    if (data.mode === "freeInput") {
      return "0".repeat(data.digit * 2); // 返回一個適當長度的空答案
    }
    const { operand1, operand2 } = data.operands || {};
    if (operand1 === undefined || operand2 === undefined) {
      return "0";
    }
    const answer = operand1 * operand2;
    return answer;
  }

  // 獲取每行的數據
  getRowSet(maxLength, data) {
    if (data.mode === "freeInput") return [];
    const { operand1, operand2 } = data.operands;
    const answer = this.getAnswer(data);
    return [
      operand1.toString().padStart(maxLength, " ").split(""),
      operand2.toString().padStart(maxLength, " ").split(""),
      answer.toString().padStart(maxLength, " ").split(""),
    ];
  }

  // 單位顯示
  getUnitLabels(unitType, customUnit) {
    if (unitType === "Custom") {
      return [" ", ...customUnit.slice(0, this.maxLength)];
    }
    const allUnits = {
      Length: ["公分", "", "", "公尺"],
      Time: ["秒", "", "分", "", "時"],
      Volume: ["毫升", "", "", "公升"],
      Weight: ["公克", "", "", "公斤"],
      Number: ["個位", "十位", "百位", "千位", "萬位"],
    };
    return [
      " ",
      ...(allUnits[unitType]?.slice(0, this.maxLength).reverse() || []),
    ];
  }

  // 處理進位顯示
  getCarry(data) {
    const carry = [{ text: "", isValid: true, visible: false }];
    for (let i = 0; i < this.maxLength; i++) {
      const isLast = i === this.maxLength - 1;
      carry.push({
        text: "",
        isValid: true,
        editable: "number",
        visible: !(isLast && data.mode !== "freeInput"),
      });
    }
    return carry;
  }
}

export default new MultiplyConfig();
