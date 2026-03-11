import { ERROR_DISPLAY, isZeroValue } from "./format.js";
import {
  calculateBinary,
  calculatePercentValue,
  toDisplayOperator,
} from "./operations.js";

export function createInitialState() {
  return {
    display: "0",
    expression: "",
    storedValue: null,
    pendingOperator: null,
    lastOperator: null,
    lastOperand: null,
    inputMode: "initial",
    resetInputOnNextDigit: false,
    justEvaluated: false,
    hasActivity: false,
  };
}

export function isErrorState(state) {
  return state.inputMode === "error";
}

export function getClearLabel(state) {
  return state.inputMode === "entering" && state.display !== "0" ? "C" : "AC";
}

export function getActiveOperator(state) {
  return state.pendingOperator;
}

function buildExpression(leftValue, operator, rightValue = null, suffix = "") {
  if (leftValue === null || !operator) {
    return "";
  }

  const parts = [String(leftValue), toDisplayOperator(operator)];

  if (rightValue !== null && rightValue !== undefined && rightValue !== "") {
    parts.push(String(rightValue));
  }

  if (suffix) {
    parts.push(suffix);
  }

  return parts.join(" ");
}

function createErrorState() {
  return {
    ...createInitialState(),
    display: ERROR_DISPLAY,
    inputMode: "error",
    hasActivity: true,
  };
}

function updatePendingExpression(state, displayValue) {
  if (state.storedValue === null || !state.pendingOperator) {
    return "";
  }

  if (displayValue === null) {
    return buildExpression(state.storedValue, state.pendingOperator);
  }

  return buildExpression(state.storedValue, state.pendingOperator, displayValue);
}

function prepareForFreshEntry(state) {
  if (state.inputMode === "result" && state.pendingOperator === null) {
    return createInitialState();
  }

  if (state.inputMode === "error") {
    return createInitialState();
  }

  return { ...state };
}

function withEditingReset(state, overrides = {}) {
  return {
    ...state,
    lastOperator: null,
    lastOperand: null,
    justEvaluated: false,
    ...overrides,
  };
}

function handleDigit(state, digit) {
  const nextState = prepareForFreshEntry(state);
  const shouldReplaceDisplay =
    nextState.inputMode === "initial" || nextState.resetInputOnNextDigit;

  const nextDisplay = shouldReplaceDisplay
    ? digit
    : nextState.display === "0"
      ? digit
      : `${nextState.display}${digit}`;

  return {
    state: withEditingReset(nextState, {
      display: nextDisplay,
      expression: updatePendingExpression(nextState, nextDisplay),
      inputMode: "entering",
      resetInputOnNextDigit: false,
      hasActivity: true,
    }),
  };
}

function handleDecimal(state) {
  const nextState = prepareForFreshEntry(state);

  if (!nextState.resetInputOnNextDigit && nextState.display.includes(".")) {
    return { state: nextState };
  }

  const nextDisplay =
    nextState.inputMode === "initial" || nextState.resetInputOnNextDigit
      ? "0."
      : `${nextState.display}.`;

  return {
    state: withEditingReset(nextState, {
      display: nextDisplay,
      expression: updatePendingExpression(nextState, nextDisplay),
      inputMode: "entering",
      resetInputOnNextDigit: false,
      hasActivity: true,
    }),
  };
}

function handleOperator(state, operator, precision) {
  if (state.pendingOperator && state.storedValue !== null) {
    if (state.inputMode === "operator-pending" || state.resetInputOnNextDigit) {
      return {
        state: {
          ...state,
          pendingOperator: operator,
          expression: buildExpression(state.storedValue, operator),
          hasActivity: true,
        },
      };
    }

    const evaluation = calculateBinary(
      state.storedValue,
      state.display,
      state.pendingOperator,
      precision
    );

    if (evaluation.error) {
      return {
        state: createErrorState(),
      };
    }

    const nextDisplay = evaluation.value;
    const evaluatedExpression = buildExpression(
      evaluation.leftOperand,
      evaluation.operator,
      evaluation.rightOperand,
      "="
    );

    return {
      state: {
        ...state,
        display: nextDisplay,
        expression: buildExpression(nextDisplay, operator),
        storedValue: nextDisplay,
        pendingOperator: operator,
        lastOperator: null,
        lastOperand: null,
        inputMode: "operator-pending",
        resetInputOnNextDigit: true,
        justEvaluated: false,
        hasActivity: true,
      },
      emittedResult: {
        reason: "chain",
        leftOperand: evaluation.leftOperand,
        rightOperand: evaluation.rightOperand,
        operator: evaluation.operator,
        value: nextDisplay,
        expression: evaluatedExpression,
      },
    };
  }

  const storedValue = state.display;

  return {
    state: {
      ...state,
      storedValue,
      pendingOperator: operator,
      lastOperator: null,
      lastOperand: null,
      expression: buildExpression(storedValue, operator),
      inputMode: "operator-pending",
      resetInputOnNextDigit: true,
      justEvaluated: false,
      hasActivity: true,
    },
  };
}

function handleEquals(state, precision) {
  if (state.pendingOperator && state.storedValue !== null) {
    const evaluation = calculateBinary(
      state.storedValue,
      state.display,
      state.pendingOperator,
      precision
    );

    if (evaluation.error) {
      return {
        state: createErrorState(),
      };
    }

    const nextDisplay = evaluation.value;
    const evaluatedExpression = buildExpression(
      evaluation.leftOperand,
      evaluation.operator,
      evaluation.rightOperand,
      "="
    );

    return {
      state: {
        ...state,
        display: nextDisplay,
        expression: evaluatedExpression,
        storedValue: nextDisplay,
        pendingOperator: null,
        lastOperator: evaluation.operator,
        lastOperand: evaluation.rightOperand,
        inputMode: "result",
        resetInputOnNextDigit: true,
        justEvaluated: true,
        hasActivity: true,
      },
      emittedResult: {
        reason: "equals",
        leftOperand: evaluation.leftOperand,
        rightOperand: evaluation.rightOperand,
        operator: evaluation.operator,
        value: nextDisplay,
        expression: evaluatedExpression,
      },
    };
  }

  if (state.lastOperator && state.lastOperand !== null) {
    const evaluation = calculateBinary(
      state.display,
      state.lastOperand,
      state.lastOperator,
      precision
    );

    if (evaluation.error) {
      return {
        state: createErrorState(),
      };
    }

    const nextDisplay = evaluation.value;
    const evaluatedExpression = buildExpression(
      evaluation.leftOperand,
      evaluation.operator,
      evaluation.rightOperand,
      "="
    );

    return {
      state: {
        ...state,
        display: nextDisplay,
        expression: evaluatedExpression,
        storedValue: nextDisplay,
        inputMode: "result",
        resetInputOnNextDigit: true,
        justEvaluated: true,
        hasActivity: true,
      },
      emittedResult: {
        reason: "repeat-equals",
        leftOperand: evaluation.leftOperand,
        rightOperand: evaluation.rightOperand,
        operator: evaluation.operator,
        value: nextDisplay,
        expression: evaluatedExpression,
      },
    };
  }

  return { state };
}

function handleClear(state) {
  if (getClearLabel(state) === "AC") {
    return {
      state: createInitialState(),
    };
  }

  return {
    state: withEditingReset(state, {
      display: "0",
      expression: updatePendingExpression(state, null),
      inputMode: state.pendingOperator ? "entering" : "initial",
      resetInputOnNextDigit: false,
      hasActivity: true,
    }),
  };
}

function handleSign(state) {
  if (
    isZeroValue(state.display) ||
    state.inputMode === "operator-pending" ||
    state.resetInputOnNextDigit
  ) {
    return { state };
  }

  const nextDisplay = state.display.startsWith("-")
    ? state.display.slice(1)
    : `-${state.display}`;

  return {
    state: withEditingReset(state, {
      display: nextDisplay,
      expression: updatePendingExpression(state, nextDisplay),
      inputMode: "entering",
      resetInputOnNextDigit: false,
      hasActivity: true,
    }),
  };
}

function handlePercent(state, precision) {
  const percentValue = calculatePercentValue({
    currentValue: state.display,
    storedValue: state.storedValue,
    pendingOperator: state.pendingOperator,
    precision,
  });

  if (percentValue.error) {
    return { state };
  }

  if (state.pendingOperator && state.storedValue !== null) {
    const evaluation = calculateBinary(
      state.storedValue,
      percentValue.value,
      state.pendingOperator,
      precision
    );

    if (evaluation.error) {
      return {
        state: createErrorState(),
      };
    }

    return {
      state: {
        ...state,
        display: evaluation.value,
        expression: `${state.storedValue} ${toDisplayOperator(
          state.pendingOperator
        )} ${state.display}% =`,
        storedValue: evaluation.value,
        pendingOperator: null,
        lastOperator: state.pendingOperator,
        lastOperand: percentValue.value,
        inputMode: "result",
        resetInputOnNextDigit: true,
        justEvaluated: true,
        hasActivity: true,
      },
    };
  }

  return {
    state: withEditingReset(state, {
      display: percentValue.value,
      expression: updatePendingExpression(state, percentValue.value),
      inputMode: "entering",
      resetInputOnNextDigit: false,
      hasActivity: true,
    }),
  };
}

export function applyCalculatorAction(state, action, options = {}) {
  const precision = options.precision ?? 12;

  if (action.type === "clear") {
    return handleClear(state);
  }

  if (isErrorState(state)) {
    if (action.type === "digit") {
      return handleDigit(createInitialState(), action.value);
    }

    return { state };
  }

  switch (action.type) {
    case "digit":
      return handleDigit(state, action.value);
    case "decimal":
      return handleDecimal(state);
    case "operator":
      return handleOperator(state, action.value, precision);
    case "equals":
      return handleEquals(state, precision);
    case "sign":
      return handleSign(state);
    case "percent":
      return handlePercent(state, precision);
    case "reset":
      return { state: createInitialState() };
    default:
      return { state };
  }
}
