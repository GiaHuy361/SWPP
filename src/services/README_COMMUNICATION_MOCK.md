# Communication API Mock Fallback

## Tổng quan

Tính năng này cho phép ứng dụng tiếp tục hoạt động khi Communication API backend gặp lỗi hoặc chưa sẵn sàng. Hệ thống sẽ tự động chuyển sang sử dụng dữ liệu giả lập (mock data) khi API thật gặp lỗi.

## Các tính năng chính

1. **Tự động phát hiện lỗi API**: Tự động phát hiện khi API thật gặp lỗi và chuyển sang sử dụng dữ liệu giả lập.
2. **Dữ liệu giả lập nhất quán**: Dữ liệu giả lập được thiết kế để phản ánh cấu trúc thực tế của API.
3. **Công cụ kiểm soát trong development**: Component `CommunicationMockSwitcher` cho phép bật/tắt tính năng này trong môi trường development.

## Cách sử dụng

### Bật/Tắt tính năng Mock Fallback

- Trong môi trường development, sẽ có một nút ở góc dưới bên phải màn hình.
- Khi nhấn vào nút này, bạn có thể bật/tắt tính năng mock fallback.
- Khi chức năng được bật, các API call thất bại sẽ tự động chuyển sang sử dụng dữ liệu giả lập.

> **LƯU Ý QUAN TRỌNG:** Đối với các trang quản trị (Admin) như `/admin/communication/programs/:id`, nên TẮT tính năng mock data để sử dụng API thật. Dữ liệu giả lập có thể không đủ chi tiết cho các chức năng quản trị.

### Xác định nguồn dữ liệu

Khi sử dụng developer tools của trình duyệt, bạn có thể xem console để biết dữ liệu đang được lấy từ đâu:

- Lỗi API sẽ được hiển thị với màu đỏ, bao gồm chi tiết lỗi
- Khi sử dụng dữ liệu giả lập, sẽ có thông báo với màu cam

## Cấu trúc code

- `mockCommunicationApi.js`: Chứa tất cả các hàm và dữ liệu giả lập cho các API communication
- `communicationApi.js`: Chứa logic để tự động chuyển đổi giữa API thật và dữ liệu giả lập
- `CommunicationMockSwitcher.jsx`: Component UI để bật/tắt tính năng

## Lưu ý

- Tính năng này chỉ nên được sử dụng trong quá trình phát triển hoặc khi API backend chưa sẵn sàng.
- Dữ liệu giả lập không phản ánh chính xác dữ liệu thực tế từ backend.
- Trong môi trường production, tính năng này nên được tắt bằng cách đặt `USE_MOCK_FALLBACK = false` trong `communicationApi.js`.
- **Khắc phục vấn đề không hiển thị dữ liệu trong trang Admin**: 
  1. Tắt tính năng mock data bằng cách nhấp vào nút ở góc dưới bên phải
  2. Kiểm tra console trong DevTools để xem có lỗi API không
  3. Đảm bảo API backend đang hoạt động và truy cập được từ môi trường của bạn
  4. Nếu vẫn gặp vấn đề, thử reload trang sau khi tắt tính năng mock data
