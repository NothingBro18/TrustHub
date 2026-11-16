export const isValidPaymentAmount = (value) => {
  if (typeof value !== 'string' || value.trim() === '') return false;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0;
};

export const isValidPriceRange = (minValue, maxValue) => {
  if (
    typeof minValue !== 'string' || minValue.trim() === '' ||
    typeof maxValue !== 'string' || maxValue.trim() === ''
  ) return false;
  const min = Number(minValue);
  const max = Number(maxValue);
  return Number.isFinite(min) && Number.isFinite(max) &&
    min >= 0 && max >= min;
};
