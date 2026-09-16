# Bếp Chay — Quy ước làm việc

## Mục tiêu

Xây webapp cá nhân, ưu tiên điện thoại, giúp gia đình quyết định hôm nay ăn gì, xem và chỉnh công thức chay, lập kế hoạch tuần và danh sách đi chợ.

## Nguyên tắc sản phẩm

- Tiếng Việt là ngôn ngữ chính.
- Giao diện nhẹ nhàng: nền kem, xanh lá dịu, rõ ràng trên điện thoại.
- Mở ứng dụng là thấy gợi ý hôm nay; không bắt người dùng nhập nhiều dữ liệu.
- Gợi ý mặc định dựa trên kho công thức đã duyệt và các quy tắc xác định, không gọi AI.
- Chế độ ăn: không thịt, cá, hải sản, trứng, gelatin động vật và thành phần động vật khác; cho phép sữa, sản phẩm từ sữa, mật ong và lượng nhỏ rượu/bia dùng khi nấu.
- Vị cay ở mức thấp; món cay chỉ xuất hiện thỉnh thoảng. Hạn chế chao.
- Nội dung do người dùng sửa không bao giờ bị seed hoặc cập nhật phần mềm ghi đè.
- Ảnh là phần bổ sung sau; mọi chức năng phải dùng được với ảnh giữ chỗ.

## Phạm vi MVP

- Mã truy cập dùng chung cho gia đình, ghi nhớ thiết bị.
- Gợi ý bữa sáng, trưa, tối hoặc bữa phụ theo cài đặt.
- Chọn số người theo ngày hoặc từng bữa.
- Bộ lọc nhanh: hợp khẩu vị, nấu nhanh, tận dụng nguyên liệu, tiết kiệm, cân đối nhóm thực phẩm.
- Chốt bữa, đổi món, ghi nhận đã nấu hoặc bỏ qua.
- Kho món: xem, tìm, lọc, yêu thích, thêm, sửa và ẩn công thức.
- Nhập nhanh nguyên liệu đang có; không quản lý tồn kho định lượng.
- Kế hoạch tuần và danh sách đi chợ dùng chung.
- Đọc công thức đã đồng bộ khi ngoại tuyến; sửa dữ liệu cần có mạng.
- Sao lưu hàng tuần, giữ tối đa hai bản hoàn tất gần nhất.

## Ngoài phạm vi MVP

- Gọi AI trực tiếp trong ứng dụng.
- Tính kcal, macro hoặc tư vấn dinh dưỡng cá nhân.
- Quản lý tồn kho và giá nguyên liệu chi tiết.
- Hồ sơ và phân quyền riêng cho từng thành viên.
- Sửa dữ liệu khi ngoại tuyến và tự xử lý xung đột phức tạp.
- Xử lý hàng loạt bộ poster cũ.

## Tiêu chuẩn kỹ thuật

- Node.js 24, TypeScript, React và Vite.
- Một tiến trình Node/Express phục vụ cả API và bản build giao diện để phù hợp Tenten Vibe Hosting.
- Firestore là nguồn dữ liệu chính. R2 chứa ảnh và bản sao lưu.
- Bí mật chỉ nằm ở biến môi trường phía máy chủ; không commit khóa hay mã truy cập dạng rõ.
- Dữ liệu seed phải có phiên bản và chỉ thêm bản ghi chưa tồn tại.
- Dữ liệu công thức cần có cấu trúc: khẩu phần, thời gian, nguyên liệu định lượng, bước nấu, nhóm món, vai trò bữa ăn, thiết bị, nguồn và trạng thái kiểm chứng.
- Ưu tiên thao tác chạm, chữ dễ đọc, hỗ trợ bàn phím và độ tương phản phù hợp.
- Thay đổi logic gợi ý, xác thực, đồng bộ hoặc sao lưu phải có kiểm thử thích hợp.

## Quy trình

- Đọc `docs/PROJECT.md`, `docs/PLAN.md` và `docs/STATUS.md` trước khi thay đổi phạm vi.
- Cập nhật `docs/STATUS.md` sau mỗi mốc có thể bàn giao.
- Kiểm tra build, test và luồng chính trước khi báo hoàn thành.
- Những phần phụ thuộc tài khoản Tenten, Firebase hoặc Cloudflare phải có hướng dẫn từng bước cho người không biết code.

