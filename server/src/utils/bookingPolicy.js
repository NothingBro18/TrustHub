const STATUS_TRANSITIONS = {
  pending: ['accepted', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const validateAppointment = (date, time, now = new Date()) => {
  const dateParts = typeof date === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const requestedDate = dateParts
    ? new Date(Date.UTC(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3])))
    : null;
  const hasValidDate = dateParts && requestedDate.getUTCFullYear() === Number(dateParts[1]) &&
    requestedDate.getUTCMonth() + 1 === Number(dateParts[2]) &&
    requestedDate.getUTCDate() === Number(dateParts[3]);
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (!hasValidDate || date < today) return 'Choose a valid date that is not in the past';
  if (typeof time !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return 'Choose a valid appointment time';
  }
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (date === today && time <= currentTime) return 'Choose an appointment time in the future';
  return null;
};

const isValidCollectedAmount = (amount) =>
  typeof amount === 'number' && Number.isFinite(amount) && amount > 0;

const isAllowedBookingUpdate = ({ role, currentStatus, nextStatus, ownsBooking, ownsProvider }) => {
  if (!Object.hasOwn(STATUS_TRANSITIONS, nextStatus)) return false;
  if (role === 'customer') {
    return ownsBooking && nextStatus === 'cancelled' && !['completed', 'cancelled'].includes(currentStatus);
  }
  if (role === 'provider') {
    return ownsProvider && STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus) === true;
  }
  if (role === 'admin') {
    return !['completed', 'cancelled'].includes(currentStatus);
  }
  return false;
};

module.exports = {
  STATUS_TRANSITIONS,
  isAllowedBookingUpdate,
  validateAppointment,
  isValidCollectedAmount,
};
