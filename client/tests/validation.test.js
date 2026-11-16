import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidPaymentAmount, isValidPriceRange } from '../src/utils/validation.js';

test('payment input requires a finite positive amount', () => {
  assert.equal(isValidPaymentAmount('125.50'), true);
  assert.equal(isValidPaymentAmount(''), false);
  assert.equal(isValidPaymentAmount('  '), false);
  assert.equal(isValidPaymentAmount('0'), false);
  assert.equal(isValidPaymentAmount('-1'), false);
  assert.equal(isValidPaymentAmount('abc'), false);
});

test('service price range requires non-negative numbers with min no greater than max', () => {
  assert.equal(isValidPriceRange('0', '0'), true);
  assert.equal(isValidPriceRange('100', '150.5'), true);
  assert.equal(isValidPriceRange('', '150'), false);
  assert.equal(isValidPriceRange('  ', '150'), false);
  assert.equal(isValidPriceRange('-1', '150'), false);
  assert.equal(isValidPriceRange('151', '150'), false);
  assert.equal(isValidPriceRange('abc', '150'), false);
});
