# Bếp Chay

Webapp dùng chung trong gia đình để gợi ý món chay hằng ngày, quản lý công thức, lên kế hoạch tuần và tạo danh sách đi chợ.

Trạng thái hiện tại: MVP chạy cục bộ đã sẵn sàng để kiểm thử; kết nối dịch vụ thật và nội dung công thức còn đang hoàn thiện. Xem [mô tả dự án](docs/PROJECT.md), [kế hoạch](docs/PLAN.md), [trạng thái](docs/STATUS.md) và [triển khai](docs/DEPLOYMENT.md).

## Chạy thử

1. Sao chép `.env.example` thành `.env` và đặt mã truy cập.
2. Chạy `pnpm install`.
3. Chạy `pnpm run dev` rồi mở `http://localhost:5173`.

Nếu chưa cấu hình Firebase, ứng dụng dùng dữ liệu cục bộ trên trình duyệt. Không đưa `.env` lên GitHub.
