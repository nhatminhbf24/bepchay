# Trạng thái dự án

Ngày cập nhật: 2026-09-16

## Hiện tại

- Yêu cầu MVP đã được người dùng xác nhận và tài liệu nền tảng đã có commit đầu tiên `1290309`.
- MVP chạy cục bộ đã có giao diện ưu tiên điện thoại, khóa truy cập, gợi ý hôm nay, kho 26 món, chỉnh món, kế hoạch tuần, đi chợ và cài đặt.
- Bộ máy gợi ý, đổi khẩu phần và tổng hợp nguyên liệu đã có kiểm thử.
- API Firestore, phát hiện xung đột phiên bản và sao lưu R2 giữ hai bản đã được cài đặt nhưng chưa thể kiểm thử với tài khoản thật.
- 26 công thức hiện vẫn mang trạng thái `draft`; cần đối chiếu từng nguồn trước khi coi là nội dung hoàn chỉnh.

## Quyết định đã chốt

- Dùng chung cho gia đình, một mã truy cập và một không gian dữ liệu.
- Màn hình Hôm nay là trọng tâm.
- 26 công thức Việt ban đầu; ảnh bổ sung sau.
- Gợi ý bằng quy tắc; không gọi AI trong MVP.
- Nhập nhanh nguyên liệu đang có; không quản lý kho định lượng.
- Có đọc ngoại tuyến và sao lưu hàng tuần, giữ hai bản.
- Ngân sách bổ sung mục tiêu 0 đồng.

## Việc tiếp theo

1. Đối chiếu và biên tập 26 công thức.
2. Kiểm thử cài đặt Firestore/R2 bằng tài khoản thật.
3. Triển khai thử qua GitHub lên Tenten và kiểm tra trên điện thoại.
4. Bổ sung ảnh do người dùng cung cấp.

## Chưa xác minh

- Cách đặt biến môi trường và lệnh start trên Tenten Vibe Hosting.
- Kết nối Firestore/R2 từ môi trường Tenten thực tế.
- Lịch sao lưu tự động trong tài khoản Cloudflare của người dùng.
