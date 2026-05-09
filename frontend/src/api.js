import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getServices  = ()              => api.get('/services');
export const getSlots     = (date, svcId)   => api.get(`/slots?date=${date}&service_id=${svcId}`);
export const createBooking = (data)         => api.post('/bookings', data);
export const getBookings  = (date)          => api.get(`/bookings?date=${date}`);
export const updateBooking = (id, status)   => api.patch(`/bookings/${id}`, { status });
export const getBlocked   = (date)          => api.get(`/blocked?date=${date}`);
export const blockSlot    = (data)          => api.post('/blocked', data);
export const deleteBlock  = (id)            => api.delete(`/blocked/${id}`);
