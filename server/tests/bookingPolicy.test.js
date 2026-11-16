const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isAllowedBookingUpdate,
  validateAppointment,
  isValidCollectedAmount,
} = require('../src/utils/bookingPolicy');

const request = (overrides = {}) => ({
  role: 'provider',
  currentStatus: 'pending',
  nextStatus: 'accepted',
  ownsBooking: false,
  ownsProvider: true,
  ...overrides,
});

test('customers may cancel only their own active bookings', () => {
  assert.equal(isAllowedBookingUpdate(request({
    role: 'customer',
    nextStatus: 'cancelled',
    ownsBooking: true,
    ownsProvider: false,
  })), true);
  assert.equal(isAllowedBookingUpdate(request({
    role: 'customer',
    ownsBooking: false,
    ownsProvider: false,
  })), false);
  assert.equal(isAllowedBookingUpdate(request({
    role: 'customer',
    currentStatus: 'completed',
    nextStatus: 'cancelled',
    ownsBooking: true,
    ownsProvider: false,
  })), false);
});

test('providers can advance only their own booking through valid transitions', () => {
  assert.equal(isAllowedBookingUpdate(request()), true);
  assert.equal(isAllowedBookingUpdate(request({ nextStatus: 'completed' })), false);
  assert.equal(isAllowedBookingUpdate(request({ ownsProvider: false })), false);
  assert.equal(isAllowedBookingUpdate(request({
    currentStatus: 'in_progress',
    nextStatus: 'completed',
  })), true);
});

test('admins may update non-final bookings but not change finalized bookings', () => {
  assert.equal(isAllowedBookingUpdate(request({ role: 'admin' })), true);
  assert.equal(isAllowedBookingUpdate(request({
    role: 'admin',
    currentStatus: 'completed',
    nextStatus: 'cancelled',
  })), false);
  assert.equal(isAllowedBookingUpdate(request({
    role: 'admin',
    nextStatus: 'invalid',
  })), false);
});

test('appointment validation rejects invalid, past, and non-future same-day appointments', () => {
  const now = new Date(2026, 10, 14, 13, 27);
  assert.equal(validateAppointment('2026-02-30', '14:00', now), 'Choose a valid date that is not in the past');
  assert.equal(validateAppointment('2026-11-13', '14:00', now), 'Choose a valid date that is not in the past');
  assert.equal(validateAppointment('2026-11-14', '13:27', now), 'Choose an appointment time in the future');
  assert.equal(validateAppointment('2026-11-14', '14:00', now), null);
});

test('appointment validation accepts a future date and rejects malformed time', () => {
  const now = new Date(2026, 10, 14, 13, 27);
  assert.equal(validateAppointment('2026-11-15', '25:00', now), 'Choose a valid appointment time');
  assert.equal(validateAppointment('2026-11-15', '09:00', now), null);
});

test('collected payments require a finite positive numeric amount', () => {
  assert.equal(isValidCollectedAmount(125.5), true);
  assert.equal(isValidCollectedAmount(0), false);
  assert.equal(isValidCollectedAmount(-1), false);
  assert.equal(isValidCollectedAmount('100'), false);
  assert.equal(isValidCollectedAmount(Number.NaN), false);
  assert.equal(isValidCollectedAmount(Number.POSITIVE_INFINITY), false);
});
