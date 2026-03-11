export const DEFAULT_PRECISION = 12;
export const ERROR_DISPLAY = "Error";

export function toNumericValue(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function trimTrailingZeros(value) {
  if (!value.includes(".")) {
    return value;
  }

  return value.replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "");
}

export function normalizeResult(value, precision = DEFAULT_PRECISION) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const normalized = Number(Number(value).toPrecision(precision));
  return Object.is(normalized, -0) ? 0 : normalized;
}

export function formatResult(value, precision = DEFAULT_PRECISION) {
  const normalized = normalizeResult(value, precision);

  if (normalized === null) {
    return ERROR_DISPLAY;
  }

  return trimTrailingZeros(String(normalized));
}

export function normalizeComparableValue(value, precision = DEFAULT_PRECISION) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = toNumericValue(value);

  if (numericValue !== null) {
    return formatResult(numericValue, precision);
  }

  return String(value).trim();
}

export function matchesExpectedValue(
  actual,
  expected,
  precision = DEFAULT_PRECISION
) {
  if (actual === ERROR_DISPLAY) {
    return false;
  }

  const normalizedActual = normalizeComparableValue(actual, precision);
  const normalizedExpected = normalizeComparableValue(expected, precision);

  if (normalizedActual === null || normalizedExpected === null) {
    return false;
  }

  return normalizedActual === normalizedExpected;
}

export function isZeroValue(value) {
  const numericValue = toNumericValue(value);
  return numericValue !== null && numericValue === 0;
}
