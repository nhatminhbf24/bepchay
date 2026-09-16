# Bếp Chay

Webapp dùng chung trong gia đình để gợi ý món chay hằng ngày, quản lý công thức, lên kế hoạch tuần và tạo danh sách đi chợ.

Trạng thái hiện tại: MVP đã được triển khai tại `https://daushop.pro.vn/`. Gói Tenten đang phục vụ React tĩnh nên dữ liệu chỉnh sửa được lưu trên từng thiết bị; khi cần đồng bộ chung, bật máy chủ Node và Firestore theo [hướng dẫn triển khai](docs/DEPLOYMENT.md). Xem [mô tả dự án](docs/PROJECT.md), [kế hoạch](docs/PLAN.md) và [trạng thái](docs/STATUS.md).

## Chạy thử

1. Sao chép `.env.example` thành `.env` và đặt mã truy cập.
2. Chạy `pnpm install`.
3. Chạy `pnpm run dev` rồi mở `http://localhost:5173`.

Nếu hosting không chuyển tiếp được `/api`, ứng dụng tự chuyển sang dữ liệu cục bộ trên trình duyệt và vẫn mở bằng mã `2410`. Không đưa `.env` lên GitHub.
