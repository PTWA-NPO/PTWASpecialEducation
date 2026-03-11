import {
  DEFAULT_PRECISION,
  formatResult,
  toNumericValue,
} from "./format.js";

export const OPERATORS = ["+", "-", "×", "÷"];

export function isOperator(value) {
  return OPERATORS.includes(value);
}

export function toDisplayOperator(operator) {
  return operator === "-" ? "−" : operator;
}

export function calculateBinary(leftValue, rightValue, operator, precision) {
  const left = toNumericValue(leftValue);
  const right = toNumericValue(rightValue);

  if (left === null || right === null || !isOperator(operator)) {
    return {
      error: true,
      reason: "invalid-input",
    };
  }

  if (operator === "÷" && right === 0) {
    return {
      error: true,
      reason: "divide-by-zero",
    };
  }

  let result = 0;

  switch (operator) {
    case "+":
      result = left + right;
      break;
    case "-":
      result = left - right;
      break;
    case "×":
      result = left * right;
      break;
    case "÷":
      result = left / right;
      break;
  }

  return {
    error: false,
    leftOperand: String(leftValue),
    rightOperand: String(rightValue),
    operator,
    value: formatResult(result, precision ?? DEFAULT_PRECISION),
  };
}

export function calculatePercentValue({
  currentValue,
  storedValue,
  pendingOperator,
  precision = DEFAULT_PRECISION,
}) {
  const current = toNumericValue(currentValue);

  if (current === null) {
    return {
      error: true,
      reason: "invalid-input",
    };
  }

  let result = current / 100;

  if (
    (pendingOperator === "+" || pendingOperator === "-") &&
    storedValue !== null
  ) {
    const base = toNumericValue(storedValue);

    if (base === null) {
      return {
        error: true,
        reason: "invalid-base",
      };
    }

    result = base * (current / 100);
  }

  return {
    error: false,
    value: formatResult(result, precision),
  };
}
