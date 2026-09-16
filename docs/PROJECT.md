# Mô tả dự án Bếp Chay

## Người dùng và mục tiêu

Ứng dụng phục vụ một gia đình, dùng điện thoại là chính. Mục tiêu quan trọng nhất là mở ứng dụng và nhanh chóng quyết định hôm nay ăn gì. Các mục tiêu hỗ trợ là tra cứu công thức, tìm món theo nguyên liệu đang có, và lập kế hoạch tuần khi cần.

## Trải nghiệm chính

Mỗi ngày ứng dụng tạo sẵn gợi ý cho các bữa đã bật. Người dùng chọn số người, bật một hoặc nhiều ưu tiên, đổi từng món rồi chốt bữa. Bữa đã chốt được giữ nguyên và đồng bộ cho cả nhà.

Bữa sáng thường có một món. Bữa trưa và tối có thể là mâm gồm món chính, rau và canh hoặc chuyển sang bữa đơn giản. Thời gian mặc định cho cả bữa là 30–45 phút; lựa chọn nấu nhanh ưu tiên món ngắn hơn.

## Quy tắc ăn uống

- Ưu tiên món Việt, nguyên liệu dễ mua.
- Không dùng thịt, cá, hải sản, trứng, gelatin động vật hoặc thành phần động vật khác.
- Cho phép sữa, bơ, phô mai, sữa chua, mật ong và lượng nhỏ rượu/bia trong chế biến.
- Ít cay; món cay chỉ xuất hiện thỉnh thoảng.
- Chao là nguyên liệu ít thích nên bị giảm ưu tiên.
- Dị ứng hiện chưa được cung cấp; người dùng có thể cập nhật danh sách tránh trong cài đặt.

## Nội dung ban đầu

26 món được phân bổ thành: 4 món nước, 4 món kho, 4 món canh, 4 món xào, 3 món chiên/áp chảo, 3 món hấp/luộc, 2 món gỏi/trộn và 2 món cơm/cháo.

Mỗi công thức có khẩu phần gốc, định lượng, thời gian chủ động và chuẩn bị trước, thiết bị, nguyên liệu thay thế, các bước rõ ràng, dấu hiệu thành phẩm, nguồn tham khảo và trạng thái “đã đối chiếu nguồn” hoặc “đã nấu thử”. Ảnh do người dùng cung cấp sau.

## Chức năng MVP

1. Khóa truy cập chung, ghi nhớ thiết bị.
2. Gợi ý và chốt bữa hôm nay.
3. Kho công thức có tìm kiếm, lọc, yêu thích và quản lý món.
4. Nhập nhanh nguyên liệu đang có.
5. Kế hoạch tuần tùy chọn.
6. Danh sách đi chợ tổng hợp từ thực đơn.
7. Cài đặt bữa gợi ý, khẩu vị và nguyên liệu cần tránh.
8. Đọc công thức ngoại tuyến.
9. Sao lưu hằng tuần, giữ hai bản gần nhất.

## Dữ liệu và kiến trúc

React/Vite cung cấp giao diện. Node.js/Express phục vụ bản build và API trong cùng một tiến trình. Firestore giữ công thức, lịch ăn, cài đặt và danh sách đi chợ. Cloudflare R2 giữ ảnh và bản sao lưu. Service worker và IndexedDB/cache trình duyệt hỗ trợ đọc ngoại tuyến.

Ứng dụng triển khai từ GitHub lên Tenten Vibe Hosting với Node.js 24. Khóa dịch vụ được cấu hình qua biến môi trường trên máy chủ. Nếu Tenten không cho cấu hình biến môi trường an toàn, phần kết nối dịch vụ phải dừng để chọn giải pháp thay thế trước khi đưa dữ liệu thật lên.

## Chi phí

Mục tiêu là 0 đồng mỗi tháng ngoài hosting và tên miền đang có. Thiết kế sử dụng hạn mức miễn phí của Firestore, R2 và Cloudflare Workers. Hạn mức không phải cam kết giá cố định; tài liệu vận hành sẽ hướng dẫn bật cảnh báo chi phí và kiểm tra mức dùng.

## Tiêu chí hoàn thành

- Gợi ý không vi phạm chế độ ăn và giải thích được lý do chọn món.
- Đổi khẩu phần cập nhật đúng định lượng.
- Công thức người dùng sửa tồn tại sau khi cập nhật phần mềm.
- Thiết bị khác thấy dữ liệu chung sau khi đồng bộ.
- Công thức đã tải đọc được khi mất mạng.
- Danh sách đi chợ được tạo từ kế hoạch và có thể đánh dấu chung.
- Bản sao lưu tạo, luân phiên và khôi phục thử thành công.
- Ứng dụng build và chạy được trên Node.js 24; luồng triển khai Tenten được ghi lại rõ ràng.

