import api from './api.js';

export const fetchTrusts = async () => (await api.get('/trusts')).data;

export const updateVerificationStatus = async (trustId, verificationStatus) => (
  await api.patch(`/trusts/${trustId}/verify`, { verificationStatus })
).data;