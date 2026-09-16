# Triển khai và vận hành

Tài liệu này là danh sách triển khai dự kiến. Các tên nút cụ thể sẽ được bổ sung sau lần triển khai thử trên tài khoản thật.

Luồng dự kiến:

1. Tạo dự án Firebase và database Firestore.
2. Tạo bucket Cloudflare R2 và khóa truy cập giới hạn đúng bucket.
3. Đặt biến môi trường bí mật trên Tenten.
4. Dán link GitHub, chọn tên miền và Node.js 24, rồi triển khai.
5. Kiểm tra sức khỏe, đăng nhập bằng mã truy cập và nhập dữ liệu seed.
6. Bật cảnh báo chi phí và lịch sao lưu hàng tuần.

Không đưa tệp `.env`, khóa dịch vụ, mật khẩu hoặc mã truy cập dạng rõ lên GitHub.

## Biến môi trường cần đặt trên Tenten

- `NODE_ENV=production`
- `ACCESS_CODE`: mã vào bếp đã thống nhất, đặt trực tiếp trên hosting.
- `SESSION_SECRET`: chuỗi ngẫu nhiên dài, chỉ dùng ký phiên đăng nhập.
- `DATA_PROVIDER=firestore`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`
- `BACKUP_TOKEN`: chuỗi ngẫu nhiên riêng cho lịch sao lưu.

Ứng dụng có endpoint `/api/health` để kiểm tra máy chủ. `DATA_PROVIDER=local` chỉ dành cho xem thử trên một thiết bị; dữ liệu gia đình dùng chung cần `firestore`.

## Sao lưu hàng tuần

Thư mục `cloudflare-worker` chứa lịch mẫu chạy 10:00 sáng Chủ nhật theo giờ Việt Nam (03:00 UTC). Worker gọi endpoint sao lưu bằng `BACKUP_TOKEN`. Máy chủ lấy trạng thái Firestore, ghi JSON riêng tư vào R2, kiểm tra thao tác thành công rồi chỉ giữ hai tệp mới nhất.

## Lệnh dự án

- `pnpm install`: cài thư viện và tạo bản build.
- `pnpm run dev`: chạy giao diện và máy chủ khi phát triển.
- `pnpm run test`: kiểm tra logic.
- `pnpm start`: chạy bản sản xuất trên cổng do hosting cung cấp.

Tenten cần hỗ trợ biến môi trường cho các bí mật trên. Nếu giao diện triển khai không có mục này, cần yêu cầu hỗ trợ Tenten xác nhận trước khi kết nối dữ liệu thật.
