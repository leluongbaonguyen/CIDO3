# 🏨 XTRAVEL - HOTEL BOOKING SYSTEM (Hệ thống đặt phòng khách sạn)

**Đồ án CDIO - SE 397 N**
**Trường Đại Học Duy Tân - Khoa Công Nghệ Thông Tin**

**Giảng viên hướng dẫn:** ThS. Hồ Lê Viết Nin

### 👥 Nhóm Thực Hiện: Nhóm 04
1. **Lê Lương Bảo Nguyên** (Trưởng nhóm) - 28211152259
2. **Trịnh Hồng Cường** - 28211151710
3. **Phan Thị Phước Hiền** - 29301325888
4. **Trần Huy** - 28211152835
5. **Trần Tấn Nguyên** - 28211151021

---

## 📖 Tổng Quan Dự Án
Website Hotel Booking System được xây dựng nhằm cung cấp nền tảng đặt phòng trực tuyến tiện lợi cho khách hàng và công cụ quản lý hiệu quả cho phía khách sạn. Hệ thống giúp người dùng dễ dàng tìm kiếm, so sánh giá cả, lựa chọn phòng phù hợp và thực hiện đặt phòng chỉ trong vài thao tác, đồng thời giúp khách sạn tối ưu hóa doanh thu và nâng cao hiệu quả quản lý.

## 🚀 Tính Năng Nổi Bật

### 👤 Dành cho Khách hàng (Customer)
- **Đăng ký / Đăng nhập** tài khoản bảo mật.
- **Tìm kiếm phòng** theo tiêu chí đa dạng (giá, loại phòng, ngày check-in/out).
- **Xem chi tiết phòng** bao gồm hình ảnh, tiện nghi, và mô tả.
- **Đặt phòng & Thanh toán trực tuyến** an toàn, nhanh chóng.
- **Quản lý đơn đặt phòng**, xem chi tiết lịch sử và hủy đơn nếu cần.
- **Đánh giá & Nhận xét** chất lượng phòng sau khi sử dụng.
- **Tương tác trực tuyến** qua hệ thống Chatbot/Hỗ trợ khách hàng.

### 💼 Dành cho Quản lý & Nhân viên (Admin / Staff)
- **Quản lý hệ thống phòng**: Thêm, sửa, xóa, và cập nhật trạng thái phòng (trống, đã đặt, bảo trì).
- **Quản lý khách hàng & nhân viên**: Phân quyền, kiểm soát truy cập và quản trị tài khoản.
- **Quản lý đơn đặt phòng**: Theo dõi, xác nhận và cập nhật tình trạng booking.
- **Thống kê & Báo cáo**: Phân tích doanh thu, tỷ lệ lấp đầy, số lượng booking theo thời gian.
- **Quản lý đánh giá**: Xem và phản hồi các đánh giá của khách hàng.
- **Hỗ trợ khách hàng**: Phản hồi trực tiếp các yêu cầu hỗ trợ.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)
- **Frontend:** React, JSX, Vite, CSS (Giao diện chuẩn Responsive).
- **Backend:** Node.js, Express.js.
- **Cơ sở dữ liệu:** MySQL (Được thiết kế chuẩn hóa mức vật lý với hơn 15 bảng).
- **Mô hình kiến trúc:** MVC / RESTful API.

---

## 📂 Cấu Trúc Cơ Sở Dữ Liệu
Cơ sở dữ liệu được thiết kế tối ưu với các bảng liên kết chặt chẽ:
- **Người dùng & Phân quyền:** `users`, `role`, `employee_roles`, `customers`, `employee`.
- **Dữ liệu phòng:** `room`, `room_type`, `room_image`, `amenity`, `room_type_amenity`, `seasonal_rates`, `maintenance_record`.
- **Giao dịch & Đặt phòng:** `booking`, `booking_items`, `payment`, `discounts`.
- **Hệ thống & Đánh giá:** `review`, `audit_logs`.

---

## ⚙️ Hướng Dẫn Cài Đặt (Setup Instructions)

### 1. Cài đặt Backend
```bash
cd backend
npm install
cp .env.example .env
# 1. Tạo database trong MySQL 
# 2. Chạy các script SQL từ thư mục src/sql (chạy schema.sql trước, sau đó seed.sql)
# 3. Nạp dữ liệu tài khoản mẫu (Admin/Staff/Customer)
node seedUsers.js

# Khởi động server backend
npm run dev
```

### 2. Cài đặt Frontend
```bash
cd frontend
npm install
# Khởi động server frontend
npm run dev
```
Hệ thống Frontend sẽ chạy ở địa chỉ `http://localhost:5174` (hoặc theo cấu hình hiển thị của Vite). Mở trình duyệt để trải nghiệm!
