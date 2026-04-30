# BẢN ĐẶC TẢ NGHIỆP VỤ HỆ THỐNG (BUSINESS LOGIC)
**Dự án: XTRAVEL - HOTEL BOOKING SYSTEM (Đồ án CDIO)**

Tài liệu này mô tả chi tiết các tác nhân (Actors), phân quyền, và toàn bộ luồng nghiệp vụ end-to-end đang được vận hành và tích hợp bên trong hệ thống XTravel.

---

## 1. DANH SÁCH TÁC NHÂN (ACTORS)

| Tác nhân | Ký hiệu | Mô tả |
| :--- | :--- | :--- |
| **Khách vãng lai** | `Guest` | Chưa đăng nhập, chỉ có thể tìm kiếm, xem danh sách phòng và chi tiết phòng. |
| **Khách hàng** | `Customer` | Đã đăng nhập, có quyền đặt phòng, hủy phòng, thanh toán, đánh giá. |
| **Nhân viên** | `Staff` | Xử lý booking, Check-in/Check-out, cập nhật trạng thái phòng thực tế, hỗ trợ khách hàng. |
| **Quản trị viên** | `Admin` | Quyền tối cao, quản trị nhân sự, hệ thống phòng, duyệt đánh giá và xem báo cáo thống kê. |
| **Cổng thanh toán** | `Payment Gateway`| Hệ thống bên thứ 3 (VD: VNPay) xử lý giao dịch. |
| **Hệ thống** | `System` | Bot/Cronjob tự động kiểm tra trạng thái phòng, gửi thông báo và tính toán giá trị. |

---

## 2. NGHIỆP VỤ CHI TIẾT THEO TÁC NHÂN

### I. GUEST (Khách Vãng Lai)
- **Xem phòng:** Chỉ hiển thị những phòng có trạng thái `AVAILABLE`.
- **Luồng (Flow):** Nhập filter (Ngày, Số khách) -> Click Search -> Hệ thống trả về danh sách -> Xem chi tiết (Hình ảnh, Review).
- **Đăng ký (Register):** Kiểm tra `email` tồn tại. Nếu chưa, băm (hash) mật khẩu và `INSERT` bản ghi mới.

### II. CUSTOMER (Khách Hàng)
- **Đăng nhập:** Giới hạn số lần thử. Nếu `login_failed_attempt > 5` -> Khóa tài khoản.
- **Đặt phòng (Booking):**
  - Validation: Từ chối nếu trạng thái phòng là `MAINTENANCE`.
  - Validation: Từ chối nếu số lượng khách lớn hơn `max_occupancy`.
  - Validation: Từ chối nếu Ngày Trả Phòng <= Ngày Nhận Phòng.
  - Action: Tạo bản ghi Booking với trạng thái `PENDING`.
- **Thanh toán trực tuyến:**
  - Call API VNPay. Cập nhật `status = PAID` khi có Callback Success.
- **Hủy phòng (Cancellation Rule):**
  - **Logic ràng buộc:** Nếu thời gian hiện tại CÁCH thời gian Check-in NHỎ HƠN 24 tiếng -> Không cho phép hủy. Ngược lại -> Cho phép.
- **Đánh giá (Review):**
  - Chỉ cho phép đánh giá nếu `status == COMPLETED`.

### III. STAFF (Nhân Viên)
- **Xử lý Booking:** Xác nhận (`CONFIRM`) hoặc Từ chối các đơn `PENDING`.
- **Check-in:** Nếu là ngày đến, cập nhật Booking thành `CHECKED_IN`, trạng thái phòng thành `OCCUPIED`.
- **Check-out:** Cập nhật Booking thành `COMPLETED`, trạng thái phòng về `AVAILABLE`.

### IV. ADMIN (Quản Trị Viên)
- **CRUD:** Quản lý toàn bộ danh mục Phòng, Loại phòng, Tiện ích, và Tài khoản.
- **Phân quyền (RBAC):** Chặn toàn bộ truy cập vào Dashboard nếu `role != ADMIN` (hoặc STAFF).
- **Báo cáo (BI):** Tính tổng doanh thu (`SUM(payments)`) và Tỷ lệ lấp đầy phòng (`OccupancyRate`).

---

## 3. LUỒNG NGHIỆP VỤ FULL (END-TO-END)

1. **SEARCH:** Khách hàng tìm kiếm phòng trống theo ngày.
2. **VIEW DETAIL:** Xem hình ảnh, tiện nghi và giá phòng.
3. **LOGIN:** Yêu cầu đăng nhập trước khi thanh toán.
4. **BOOKING:** Chọn số khách, tạo đơn hàng mới (`PENDING`).
5. **PAYMENT:** Chuyển hướng sang VNPay. Thành công -> Đơn hàng `PAID/CONFIRMED`.
6. **CHECK-IN:** Đến ngày, lễ tân check-in, giao phòng (`OCCUPIED`).
7. **CHECK-OUT:** Khách rời đi, hoàn tất lưu trú (`COMPLETED`).
8. **REVIEW:** Khách hàng lên hệ thống chấm sao và viết nhận xét. Lễ tân dọn phòng, đưa về `AVAILABLE`.

*(Tất cả các log đều được hệ thống ghi nhận vào bảng `audit_logs` để truy vết).*
