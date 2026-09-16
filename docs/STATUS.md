# Trạng thái dự án

Ngày cập nhật: 2026-09-16

## Hiện tại

- Yêu cầu MVP đã được người dùng xác nhận và tài liệu nền tảng đã có commit đầu tiên `1290309`.
- MVP đã có giao diện ưu tiên điện thoại, khóa truy cập, gợi ý hôm nay, kho 26 món, chỉnh món, kế hoạch tuần, đi chợ và cài đặt; bản sửa tương thích hosting React tĩnh đã triển khai tại `https://daushop.pro.vn/`.
- Bộ máy gợi ý, đổi khẩu phần và tổng hợp nguyên liệu đã có kiểm thử.
- API Firestore, phát hiện xung đột phiên bản và sao lưu R2 giữ hai bản đã được cài đặt cho môi trường Node; Tenten hiện không chuyển tiếp `/api` nên bản đang chạy dùng localStorage trên từng thiết bị.
- 26 công thức đã được đối chiếu về phương pháp và nhóm nguyên liệu với sách/các nguồn công thức công khai; nguồn được hiển thị trong từng món. Định lượng đã được chuẩn hóa nhưng chưa nấu thử thực tế.

## Quyết định đã chốt

- Dùng chung cho gia đình, một mã truy cập và một không gian dữ liệu.
- Màn hình Hôm nay là trọng tâm.
- 26 công thức Việt ban đầu; ảnh bổ sung sau.
- Gợi ý bằng quy tắc; không gọi AI trong MVP.
- Nhập nhanh nguyên liệu đang có; không quản lý kho định lượng.
- Có đọc ngoại tuyến và sao lưu hàng tuần, giữ hai bản.
- Ngân sách bổ sung mục tiêu 0 đồng.

## Việc tiếp theo

1. Nếu cần đồng bộ cho cả nhà, cấu hình Node app và biến môi trường trên Tenten hoặc chuyển backend sang dịch vụ có API.
2. Ghi nhận các món đã nấu thử và chỉnh theo khẩu vị gia đình.
3. Bổ sung ảnh do người dùng cung cấp.

## Chưa xác minh

- Cách đặt biến môi trường và lệnh start trên Tenten Vibe Hosting.
- Kết nối Firestore/R2 từ môi trường Tenten thực tế.
- Lịch sao lưu tự động trong tài khoản Cloudflare của người dùng.
