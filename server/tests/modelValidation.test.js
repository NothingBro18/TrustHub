const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Service = require('../src/models/Service');

const serviceData = (overrides = {}) => ({
  providerId: new mongoose.Types.ObjectId(),
  title: 'Laptop repair',
  category: 'Tech Services',
  priceRange: { min: 100, max: 500 },
  ...overrides,
});

test('service accepts a valid category and price range', async () => {
  const service = new Service(serviceData());
  await assert.doesNotReject(service.validate());
});

test('service rejects negative prices and reversed price ranges', async () => {
  const negativePrice = new Service(serviceData({ priceRange: { min: -1, max: 500 } }));
  const negativeError = await negativePrice.validate().then(() => null, (error) => error);
  assert.ok(negativeError.errors['priceRange.min']);

  const reversedRange = new Service(serviceData({ priceRange: { min: 600, max: 500 } }));
  const rangeError = await reversedRange.validate().then(() => null, (error) => error);
  assert.ok(rangeError.errors['priceRange.max']);
});

test('service rejects unsupported categories', async () => {
  const service = new Service(serviceData({ category: 'Unlisted category' }));
  const error = await service.validate().then(() => null, (validationError) => validationError);
  assert.ok(error.errors.category);
});
