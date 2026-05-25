import { api } from './client';

export const getRooms = (params) => {
  const query = new URLSearchParams(params).toString();
  return api(`/rooms?${query}`);
};

export const getRoomDetail = (id) => {
  return api(`/rooms/${id}`);
};

export const getRoomTypes = () => api('/rooms/types');
export const getAmenities = () => api('/rooms/amenities');
