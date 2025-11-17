class AddSubConfig {
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
      return data.digit;
    }

    const { operand1, operand2 } = data.operands;
    const answer = data.answer;

    return Math.max(
      operand1.toString().length,
      operand2.toString().length,
      answer.toString().length
    );
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
    if (data.mode === "freeInput") {
      // freeInput 模式下，創建空的數字陣列
      return [
        new Array(maxLength).fill(" "),
        new Array(maxLength).fill(" "),
        new Array(maxLength).fill(" "),
      ];
    }

    const { operand1, operand2 } = data.operands;
    const answer = data.answer;

    return [
      operand1.toString().padStart(maxLength, " ").split(""),
      operand2.toString().padStart(maxLength, " ").split(""),
      answer.toString().padStart(maxLength, " ").split(""),
    ];
  }

  // 創建單行格子
  createRow(rowIndex, maxLength, data, rowSet) {
    const row = [];
    const isSecondRow = rowIndex === 1;
    // const isLastRow = rowIndex === 2;

    // 添加運算符號
    row.push(this.createOperatorCell(data, isSecondRow));

    // 添加數字格子
    for (let j = 0; j < maxLength; j++) {
      row.push(this.createNumberCell(rowIndex, j, maxLength, data, rowSet));
    }

    return row;
  }

  // 創建運算符號格子
  createOperatorCell(data, isSecondRow) {
    return {
      text: data.mode === "freeInput" ? "" : data.type === "add" ? "+" : "－",
      visible: isSecondRow,
      class: `${isSecondRow ? "--border-bottom" : ""}`,
      ...(isSecondRow && data.mode === "freeInput"
        ? { editable: "operator" }
        : {}),
    };
  }

  // 創建數字格子
  createNumberCell(rowIndex, colIndex, maxLength, data, rowSet) {
    const isSecondRow = rowIndex === 1;
    const isLastRow = rowIndex === 2;

    return {
      text:
        (!isLastRow || data.mode === "display") && rowSet[rowIndex]
          ? rowSet[rowIndex][colIndex]
          : "",
      ...(isLastRow && data.mode === "checkAnswer"
        ? { answer: rowSet[rowIndex] ? rowSet[rowIndex][colIndex] : "" }
        : {}),
      visible:
        data.mode === "freeInput"
          ? true
          : rowSet[rowIndex][colIndex] === " "
            ? false
            : true,
      class: `${isSecondRow ? "--border-bottom" : ""}`,
      ...(isLastRow || data.mode === "freeInput" ? { editable: "number" } : {}),
    };
  }

  // 單位顯示
  getUnitLabels(unitType, customUnit) {
    const allUnits = {
      Length: ["毫米", "公分", "", "", "公尺"],
      Time: ["分", "", "時"],
      Volume: ["毫升", "", "", "公升"],
      Weight: ["公克", "", "", "公斤"],
      Number: ["個位", "十位", "百位", "千位", "萬位"],
    };

    const source =
      unitType === "Custom" ? customUnit : allUnits[unitType] || [];
    const padded = this.slicePadReverse(source, this.maxLength);
    return [" ", ...padded];
  }

  slicePadReverse(arr, maxLength) {
    const sliced = arr.slice(0, maxLength);
    const padCount = maxLength - sliced.length;
    return sliced.concat(Array(padCount).fill("")).reverse();
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

    for (let i = 0; i < this.maxLength; i++) {
      const isLast = i === this.maxLength - 1;
      const isAdd = data.type === "add";
      const notFreeInput = data.mode !== "freeInput";

      carry.push({
        text: "",
        isValid: true,
        editable: "number",
        visible: !(isLast && isAdd && notFreeInput),
      });
    }

    return carry;
  }
}

export default new AddSubConfig();
