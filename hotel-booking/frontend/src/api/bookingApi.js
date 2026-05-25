import { api } from './client';

export const createBooking = (bookingData) => {
    return api('/bookings', {
        method: 'POST',
        body: bookingData
    });
};

export const payBooking = (bookingId, paymentData) => {
    return api(`/bookings/${bookingId}/pay`, {
        method: 'POST',
        body: paymentData
    });
};

export const getMyBookings = () => {
    return api('/bookings/my');
};

export const validateVoucher = (code) => {
    return api(`/bookings/validate-voucher/${code}`);
};
