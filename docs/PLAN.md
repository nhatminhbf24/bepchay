# Kế hoạch triển khai

## Mốc 0 — Nền tảng dự án

- Tạo tài liệu, quy ước và điểm lưu Git đầu tiên.
- Khởi tạo React/Vite/TypeScript và máy chủ Express.
- Thiết lập kiểm thử, lint và biến môi trường mẫu.

## Mốc 1 — MVP chạy cục bộ không cần tài khoản đám mây

- Dựng giao diện ưu tiên điện thoại và điều hướng chính.
- Xây mô hình dữ liệu, kho mẫu và bộ máy gợi ý xác định.
- Hoàn thiện Hôm nay, Kho món, Kế hoạch, Đi chợ, Quản lý món và Cài đặt.
- Dùng kho lưu trữ cục bộ thay thế để có thể xem và thử toàn bộ luồng ngay.

## Mốc 2 — Nội dung 26 món

- Nghiên cứu nguồn phù hợp và lập danh mục nguyên liệu chuẩn hóa.
- Soạn, đối chiếu và nhập 26 công thức.
- Kiểm tra quy tắc chế độ ăn, ghép mâm và danh sách đi chợ.

## Mốc 3 — Đồng bộ và bảo vệ dữ liệu

- Kết nối Firestore qua API máy chủ.
- Cấu hình R2 cho ảnh và sao lưu.
- Thêm mã truy cập, giới hạn thử sai và phiên ghi nhớ thiết bị.
- Thêm kiểm soát phiên bản khi hai thiết bị sửa cùng dữ liệu.

## Mốc 4 — Ngoại tuyến và sao lưu

- Lưu giao diện và công thức đã đồng bộ trên thiết bị.
- Hiển thị trạng thái ngoại tuyến và giới hạn chỉnh sửa.
- Tạo, kiểm tra và khôi phục bản sao lưu.
- Cấu hình lịch chạy hàng tuần và giữ hai bản.

## Mốc 5 — Triển khai và bàn giao

- Kiểm tra build sản xuất trên Node.js 24.
- Triển khai thử qua GitHub lên Tenten.
- Kiểm tra điện thoại, nhiều thiết bị, ngoại tuyến và phục hồi.
- Viết hướng dẫn vận hành cho người không biết code.
- Bổ sung ảnh khi người dùng cung cấp.

