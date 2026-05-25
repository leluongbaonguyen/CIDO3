# Luồng xử lý sự kiện đặt phòng sau khi chỉnh sửa

## 1. Khách đặt phòng trên website

1. Người dùng chọn ngày nhận phòng, ngày trả phòng, số khách.
2. Hệ thống lọc phòng còn trống bằng điều kiện không trùng khoảng ngày:
   - Booking cũ có `check_in_date < checkOut`
   - Và `check_out_date > checkIn`
   - Với trạng thái `PENDING`, `CONFIRMED`, `CHECKED_IN`.
3. Người dùng bấm đặt phòng.
4. Nếu chưa đăng nhập/đăng ký, frontend chuyển về trang đăng nhập.
5. Sau khi đăng ký/đăng nhập, backend chỉ cho đặt phòng khi tài khoản có hồ sơ `customers`.
6. Backend khóa phòng bằng `FOR UPDATE`, kiểm tra trạng thái phòng, sức chứa và kiểm tra trùng lịch lần cuối.
7. Nếu không trùng, hệ thống tạo booking `PENDING` và trả về `bookingId`.

## 2. Admin/Staff tạo booking

1. Admin/Staff phải chọn một khách hàng đã đăng ký trong hệ thống.
2. Backend không cho tạo booking nếu thiếu `customerId` hoặc customer không tồn tại.
3. Backend vẫn dùng cùng logic kiểm tra phòng, sức chứa và trùng lịch.
4. Booking mới được tạo ở trạng thái `PENDING`.

## 3. Admin xác nhận booking

1. Admin/Staff bấm xác nhận đơn `PENDING`.
2. Backend khóa booking cần xác nhận.
3. Backend kiểm tra lại xem phòng có bị trùng với đơn `CONFIRMED` hoặc `CHECKED_IN` khác không.
4. Nếu trùng, hệ thống báo mã booking đang xung đột.
5. Nếu không trùng, booking chuyển sang `CONFIRMED`.

## 4. Admin lọc booking theo ngày giờ

Trang Admin > Đặt phòng hiện hỗ trợ lọc:

- Trạng thái booking.
- Tên khách, email, số điện thoại, mã booking.
- Khoảng ngày lưu trú: `dateFrom`, `dateTo`.
- Khoảng ngày/giờ tạo đơn: `createdFrom`, `createdTo`.

API dùng endpoint:

```http
GET /api/admin/bookings?status=CONFIRMED&dateFrom=2026-05-20&dateTo=2026-05-25&createdFrom=2026-05-20T08:00&createdTo=2026-05-20T18:00
```
